import { Injectable, Logger } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bullmq'; // REMOVED
// import { Queue } from 'bullmq'; // REMOVED
import { PrismaService } from '../../prisma/prisma.service';
import { CrawlerService } from './crawler.service';
import { StartCrawlDto } from './dto/start-crawl.dto';

export const CRAWL_QUEUE = 'crawl-queue';
export const AI_ANALYSIS_QUEUE = 'ai-analysis-queue';

@Injectable()
export class CrawlerQueueService {
  private readonly logger = new Logger(CrawlerQueueService.name);

  constructor(
    // @InjectQueue(CRAWL_QUEUE) private crawlQueue: Queue, // REMOVED
    // @InjectQueue(AI_ANALYSIS_QUEUE) private aiQueue: Queue, // REMOVED
    private prisma: PrismaService,
    private crawlerService: CrawlerService,
  ) {}

  async queueCrawlJob(dto: StartCrawlDto, userId: string) {
    // Create DB record
    const crawlJob = await this.prisma.crawlJob.create({
      data: {
        projectId: dto.projectId,
        startUrl: dto.url,
        maxDepth: dto.maxDepth ?? 5,
        maxPages: dto.maxPages ?? 200,
        options: dto.options ?? {},
        status: 'QUEUED',
      },
    });

    // Execute crawl directly (no queue)
    this.logger.log(`Starting direct crawl job ${crawlJob.id}`);
    
    // Run in background
    this.executeCrawl(crawlJob.id, dto).catch(err => {
      this.logger.error(`Crawl job ${crawlJob.id} failed:`, err);
    });

    return { crawlJobId: crawlJob.id, status: 'QUEUED' };
  }

  private async executeCrawl(crawlJobId: string, dto: StartCrawlDto) {
    try {
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { status: 'RUNNING', startedAt: new Date() },
      });

      // Execute actual crawling
      this.logger.log(`Starting crawl for ${dto.url}...`);
      
      await this.crawlerService.crawlSite(crawlJobId, dto.url, {
        maxDepth: dto.maxDepth ?? 5,
        maxPages: dto.maxPages ?? 200,
        screenshot: dto.screenshot ?? false,
        waitForNetworkIdle: true,
        extractImages: true,
        extractForms: true,
      });

      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      this.logger.log(`Crawl job ${crawlJobId} completed successfully`);
      
      // Convert crawled pages to Page records
      this.logger.log(`Starting conversion of crawled pages to Page records...`);
      await this.convertCrawledPagesToPages(crawlJobId, dto.projectId);
      this.logger.log(`Conversion completed successfully`);
      
    } catch (error) {
      this.logger.error(`Crawl job ${crawlJobId} failed:`, error);
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { 
          status: 'FAILED',
          errors: [{ message: error.message, timestamp: new Date() }],
        },
      });
      throw error;
    }
  }

  private async convertCrawledPagesToPages(crawlJobId: string, projectId: string) {
    try {
      this.logger.log(`Converting crawled pages to Page records for job ${crawlJobId}`);
      
      const crawledPages = await this.prisma.crawledPage.findMany({
        where: { crawlJobId },
      });

      for (const crawledPage of crawledPages) {
        // Check if page already exists
        const existingPage = await this.prisma.page.findUnique({
          where: { 
            projectId_path: { 
              projectId, 
              path: crawledPage.path 
            } 
          },
        });

        if (!existingPage) {
          // Create new page
          const slug = crawledPage.path === '/' ? 'home' : 
                      crawledPage.path.replace(/^\//, '').replace(/\//g, '-') || 'page';
          
          const newPage = await this.prisma.page.create({
            data: {
              projectId,
              path: crawledPage.path,
              title: crawledPage.title || 'Untitled Page',
              slug,
              status: 'DRAFT',
              isHomepage: crawledPage.path === '/',
            },
          });
          
          this.logger.log(`Created Page record for ${crawledPage.path}`);
          
          // Extract and create content blocks from HTML
          await this.extractContentBlocks(newPage.id, crawledPage);
        }
      }
      
      this.logger.log(`Converted ${crawledPages.length} crawled pages to Page records`);
    } catch (error) {
      this.logger.error(`Failed to convert crawled pages:`, error);
      // Don't throw - this is not critical
    }
  }

  private async extractContentBlocks(pageId: string, crawledPage: any) {
    try {
      this.logger.log(`Extracting content blocks for page ${pageId}`);
      
      const metadata = crawledPage.headers || {};
      const images = crawledPage.images || [];
      const html = crawledPage.html || '';
      
      // Create SEO metadata block
      if (metadata.title || metadata.description) {
        await this.prisma.seoMetadata.create({
          data: {
            pageId,
            title: metadata.title || crawledPage.title,
            description: metadata.description || '',
            ogTitle: metadata.ogTitle || metadata.title,
            ogDescription: metadata.ogDescription || metadata.description,
            ogImage: metadata.ogImage || (images[0]?.src || ''),
            canonical: metadata.canonical || '',
            robots: metadata.robots || 'index, follow',
          },
        });
      }
      
      // Parse HTML and extract content blocks
      const contentBlocks = [];
      const components = [];
      let blockOrder = 0;
      let componentOrder = 0;
      
      // Extract from HTML using regex patterns (simple parser)
      const extractTextContent = (html: string, tag: string, type: string, namePrefix: string) => {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gis');
        const matches = html.matchAll(regex);
        const results = [];
        let index = 1;
        
        for (const match of matches) {
          const content = match[1]
            .replace(/<[^>]+>/g, '') // Remove inner HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
          
          if (content && content.length > 0 && content.length < 1000) {
            results.push({
              type,
              name: `${namePrefix} ${index}`,
              key: `${tag.toLowerCase()}_${index}`,
              value: content,
            });
            index++;
          }
        }
        return results;
      };
      
      // Extract H1 headings
      const h1s = extractTextContent(html, 'h1', 'HEADING', 'Main Heading');
      h1s.forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract H2 headings
      const h2s = extractTextContent(html, 'h2', 'HEADING', 'Section Heading');
      h2s.slice(0, 10).forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract H3 headings
      const h3s = extractTextContent(html, 'h3', 'HEADING', 'Subsection Heading');
      h3s.slice(0, 10).forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract paragraphs
      const paragraphs = extractTextContent(html, 'p', 'TEXT', 'Paragraph');
      paragraphs.slice(0, 20).forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'LONG_TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract buttons
      const buttons = extractTextContent(html, 'button', 'CTA', 'Button');
      buttons.slice(0, 10).forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract links (a tags with text)
      const links = extractTextContent(html, 'a', 'TEXT', 'Link');
      links.slice(0, 15).forEach((item) => {
        contentBlocks.push({
          pageId,
          type: item.type,
          name: item.name,
          key: item.key,
          value: item.value,
          valueType: 'TEXT',
          order: blockOrder++,
          isEditable: true,
        });
      });
      
      // Extract images with alt text
      if (images.length > 0) {
        images.slice(0, 10).forEach((img: any, index: number) => {
          contentBlocks.push({
            pageId,
            type: 'IMAGE',
            name: img.alt || `Image ${index + 1}`,
            key: `image_${index + 1}`,
            value: img.src,
            valueType: 'URL',
            order: blockOrder++,
            isEditable: true,
            metadata: { alt: img.alt, width: img.width, height: img.height },
          });
        });
      }
      
      // Create page components for structure
      // Detect common sections
      const sections = [
        { name: 'Header/Navbar', type: 'NAVBAR', selector: 'header, nav, [role="navigation"]' },
        { name: 'Hero Section', type: 'HERO', selector: '.hero, [class*="hero"], section:first-of-type' },
        { name: 'Features Section', type: 'FEATURES', selector: '[class*="feature"], [class*="benefit"]' },
        { name: 'Content Section', type: 'TEXT', selector: 'main, article, [role="main"]' },
        { name: 'Footer', type: 'FOOTER', selector: 'footer, [role="contentinfo"]' },
      ];
      
      sections.forEach((section) => {
        components.push({
          pageId,
          name: section.name,
          componentType: section.type,
          selector: section.selector,
          order: componentOrder++,
          isReusable: section.type === 'NAVBAR' || section.type === 'FOOTER',
          aiConfidence: 0.7,
        });
      });
      
      // Create all content blocks
      if (contentBlocks.length > 0) {
        await this.prisma.contentBlock.createMany({
          data: contentBlocks,
        });
        this.logger.log(`Created ${contentBlocks.length} content blocks for page ${pageId}`);
      }
      
      // Create page components
      if (components.length > 0) {
        await this.prisma.pageComponent.createMany({
          data: components,
        });
        this.logger.log(`Created ${components.length} page components for page ${pageId}`);
      }
      
    } catch (error) {
      this.logger.error(`Failed to extract content blocks:`, error);
    }
  }

  async stopCrawlJob(crawlJobId: string) {
    await this.prisma.crawlJob.update({
      where: { id: crawlJobId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Crawl job cancelled' };
  }

  async getJobStatus(crawlJobId: string) {
    const dbJob = await this.prisma.crawlJob.findUniqueOrThrow({
      where: { id: crawlJobId },
      include: { _count: { select: { crawledPages: true } } },
    });

    return {
      ...dbJob,
      totalCrawled: dbJob._count.crawledPages,
    };
  }

  async getJobsForProject(projectId: string) {
    return this.prisma.crawlJob.findMany({
      where: { projectId },
      orderBy: { queuedAt: 'desc' },
      include: { _count: { select: { crawledPages: true } } },
    });
  }

  async getJobPages(crawlJobId: string) {
    return this.prisma.crawledPage.findMany({
      where: { crawlJobId },
      select: {
        id: true, url: true, path: true, title: true,
        statusCode: true, crawledAt: true,
        images: true, forms: true,
      },
      orderBy: { crawledAt: 'asc' },
    });
  }

  async deleteJob(crawlJobId: string) {
    await this.prisma.crawlJob.delete({ where: { id: crawlJobId } });
    return { message: 'Job deleted' };
  }
}
