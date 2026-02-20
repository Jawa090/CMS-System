import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AI_ANALYSIS_QUEUE } from '../crawler/crawler-queue.service';

@Processor(AI_ANALYSIS_QUEUE)
export class AiAnalysisWorker extends WorkerHost {
  private readonly logger = new Logger(AiAnalysisWorker.name);

  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job) {
    const { crawledPageId, projectId, path } = job.data;
    this.logger.log(`AI analyzing page: ${path}`);

    // Fetch the crawled page HTML
    const crawledPage = await this.prisma.crawledPage.findUnique({
      where: { id: crawledPageId },
    });
    if (!crawledPage?.html) return;

    await job.updateProgress(10);

    // Run AI analysis
    const analysis = await this.aiService.analyzePage(crawledPage.html, crawledPage.url);
    await job.updateProgress(50);

    // Find or create Page record
    let page = await this.prisma.page.findFirst({
      where: { projectId, path: crawledPage.path },
    });

    if (!page) {
      page = await this.prisma.page.create({
        data: {
          projectId,
          path: crawledPage.path,
          title: crawledPage.title || analysis.seoData.title || path,
          slug: crawledPage.path.replace(/\//g, '-').replace(/^-/, '') || 'home',
          status: 'DRAFT',
        },
      });
    }

    await job.updateProgress(60);

    // Save detected components
    for (let i = 0; i < analysis.components.length; i++) {
      const comp = analysis.components[i];
      const savedComp = await this.prisma.pageComponent.create({
        data: {
          pageId: page.id,
          name: comp.name,
          componentType: comp.type as any,
          selector: comp.selector,
          order: i,
          aiConfidence: comp.aiConfidence,
        },
      });

      // Save component's content blocks
      for (let j = 0; j < comp.contentBlocks.length; j++) {
        const block = comp.contentBlocks[j];
        await this.prisma.contentBlock.upsert({
          where: { pageId_key: { pageId: page.id, key: block.key } },
          create: {
            pageId: page.id,
            componentId: savedComp.id,
            type: block.type as any,
            name: block.name,
            key: block.key,
            value: block.value,
            valueType: block.valueType,
            order: block.order,
          },
          update: {
            value: block.value,
            name: block.name,
          },
        });
      }
    }

    await job.updateProgress(80);

    // Save SEO metadata
    await this.prisma.seoMetadata.upsert({
      where: { pageId: page.id },
      create: {
        pageId: page.id,
        title: analysis.seoData.title,
        description: analysis.seoData.description,
        keywords: analysis.seoData.keywords,
        canonical: analysis.seoData.canonical,
        ogTitle: analysis.seoData.ogTitle,
        ogDescription: analysis.seoData.ogDescription,
        ogImage: analysis.seoData.ogImage,
        seoScore: analysis.seoData.seoScore,
      },
      update: {
        title: analysis.seoData.title,
        description: analysis.seoData.description,
        seoScore: analysis.seoData.seoScore,
      },
    });

    await job.updateProgress(100);
    this.logger.log(`✅ AI analysis complete for page: ${path}`);

    return {
      pageId: page.id,
      componentsFound: analysis.components.length,
      blocksFound: analysis.contentBlocks.length,
    };
  }
}
