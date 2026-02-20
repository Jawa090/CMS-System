// ================================================================
//  CRAWLER SERVICE — Core Playwright-based React site crawler
// ================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
// import { AiService } from '../ai/ai.service'; // REMOVED - AI optional
import {
  Browser, BrowserContext, Page as PlaywrightPage, chromium,
} from 'playwright';

export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
  followExternalLinks?: boolean;
  waitForNetworkIdle?: boolean;
  extractImages?: boolean;
  extractForms?: boolean;
  screenshot?: boolean;
}

export interface CrawledPageResult {
  url: string;
  path: string;
  title: string;
  html: string;
  markdown: string;
  links: string[];
  images: ImageData[];
  forms: any[]; // Changed from FormData[] to any[]
  metadata: Record<string, string>;
  statusCode: number;
  screenshotBase64?: string;
}

interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private browser: Browser | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    // private aiService: AiService, // REMOVED - AI optional
  ) {}

  // ── Initialize Browser ──────────────────────────────────────────────
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: this.config.get('CRAWLER_HEADLESS', 'true') === 'true',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      this.logger.log('Browser launched');
    }
    return this.browser;
  }

  // ── Main Crawl Entry ────────────────────────────────────────────────
  async crawlSite(
    crawlJobId: string,
    startUrl: string,
    options: CrawlOptions = {},
  ): Promise<void> {
    const {
      maxDepth = 5,
      maxPages = 500,
      waitForNetworkIdle = true,
      extractImages = true,
      extractForms = true,
      screenshot = false,
    } = options;

    this.logger.log(`Starting crawl for ${startUrl} (job: ${crawlJobId})`);

    const browser = await this.getBrowser();
    const context = await browser.newContext({
      userAgent: 'ReactCMS-Crawler/1.0 (https://reactcms.io/bot)',
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    // Block unnecessary resources
    await context.route('**/*.{png,jpg,gif,svg,woff,woff2,ttf,ico}', (route) => {
      if (screenshot) return route.continue();
      return route.abort();
    });

    try {
      const visited = new Set<string>();
      const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
      const baseUrl = new URL(startUrl).origin;
      let pagesProcessed = 0;

      // Update job status
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { status: 'RUNNING', startedAt: new Date() },
      });

      while (queue.length > 0 && pagesProcessed < maxPages) {
        const batch = queue.splice(0, this.config.get<number>('CRAWLER_MAX_CONCURRENT', 5));

        await Promise.allSettled(
          batch.map(async ({ url, depth }) => {
            if (visited.has(url) || depth > maxDepth) return;
            visited.add(url);

            const page = await context.newPage();
            try {
              const result = await this.crawlPage(page, url, {
                waitForNetworkIdle, extractImages, extractForms, screenshot,
              });

              // Save to DB
              await this.saveCrawledPage(crawlJobId, result);
              pagesProcessed++;

              // Update stats
              await this.prisma.crawlJob.update({
                where: { id: crawlJobId },
                data: { pagesCrawled: { increment: 1 }, pagesFound: { increment: result.links.length } },
              });

              // Add discovered links to queue
              for (const link of result.links) {
                try {
                  const linkUrl = new URL(link, baseUrl).href;
                  if (
                    linkUrl.startsWith(baseUrl) &&
                    !visited.has(linkUrl) &&
                    !this.shouldSkipUrl(linkUrl)
                  ) {
                    queue.push({ url: linkUrl, depth: depth + 1 });
                  }
                } catch { /* invalid URL */ }
              }

              this.logger.debug(`Crawled: ${url} (${pagesProcessed}/${maxPages})`);
            } catch (err) {
              this.logger.warn(`Failed to crawl ${url}: ${err.message}`);
            } finally {
              await page.close();
            }
          }),
        );
      }

      // Mark job complete
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      this.logger.log(`✅ Crawl complete. ${pagesProcessed} pages crawled (job: ${crawlJobId})`);
    } catch (err) {
      this.logger.error(`Crawl failed: ${err.message}`);
      await this.prisma.crawlJob.update({
        where: { id: crawlJobId },
        data: { status: 'FAILED', errors: { set: [err.message] } },
      });
    } finally {
      await context.close();
    }
  }

  // ── Crawl Single Page ───────────────────────────────────────────────
  async crawlPage(
    page: PlaywrightPage,
    url: string,
    options: Partial<CrawlOptions> = {},
  ): Promise<CrawledPageResult> {
    const timeout = this.config.get<number>('CRAWLER_PAGE_TIMEOUT', 30000);

    await page.goto(url, {
      waitUntil: options.waitForNetworkIdle ? 'networkidle' : 'domcontentloaded',
      timeout,
    });

    // Wait for React to hydrate - INCREASED WAIT TIME
    await page.waitForTimeout(3000); // Wait 3 seconds for React to render
    
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 }).catch(() => {});

    // Wait for body to have content
    await page.waitForFunction(() => {
      const body = document.body;
      return body && body.innerText && body.innerText.length > 100;
    }, { timeout: 10000 }).catch(() => {});

    // Scroll to trigger lazy loading
    await this.autoScroll(page);

    // Extract all data in one JS evaluation
    const extractedData = await page.evaluate(() => {
      const getMetaContent = (name: string): string => {
        const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return (el as HTMLMetaElement)?.content || '';
      };

      // Extract links
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter(Boolean);

      // Extract images
      const images = Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      }));

      // Extract forms
      const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
        action: form.action,
        method: form.method,
        fields: Array.from(form.querySelectorAll('input, textarea, select')).map((el) => ({
          name: (el as HTMLInputElement).name,
          type: (el as HTMLInputElement).type,
          placeholder: (el as HTMLInputElement).placeholder,
        })),
      }));

      // Extract metadata
      const metadata: Record<string, string> = {
        title: document.title,
        description: getMetaContent('description'),
        ogTitle: getMetaContent('og:title'),
        ogDescription: getMetaContent('og:description'),
        ogImage: getMetaContent('og:image'),
        twitterCard: getMetaContent('twitter:card'),
        canonical: (document.querySelector('link[rel="canonical"]') as HTMLLinkElement)?.href || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        robots: getMetaContent('robots'),
      };

      // Get clean text content
      const body = document.body.cloneNode(true) as HTMLElement;
      ['script', 'style', 'noscript'].forEach((tag) =>
        body.querySelectorAll(tag).forEach((el) => el.remove()),
      );

      return {
        title: document.title,
        html: document.documentElement.outerHTML,
        bodyText: body.innerText,
        links: [...new Set(links)],
        images,
        forms,
        metadata,
      };
    });

    let screenshotBase64: string | undefined;
    if (options.screenshot) {
      const buf = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 80 });
      screenshotBase64 = buf.toString('base64');
    }

    const urlObj = new URL(url);

    return {
      url,
      path: urlObj.pathname,
      title: extractedData.title,
      html: extractedData.html,
      markdown: this.htmlToMarkdown(extractedData.bodyText),
      links: extractedData.links,
      images: extractedData.images,
      forms: extractedData.forms,
      metadata: extractedData.metadata,
      statusCode: 200,
      screenshotBase64,
    };
  }

  // ── Auto scroll for lazy-loaded content ─────────────────────────────
  private async autoScroll(page: PlaywrightPage): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
      });
    }).catch(() => {});
  }

  // ── URL Filter ───────────────────────────────────────────────────────
  private shouldSkipUrl(url: string): boolean {
    const skipPatterns = [
      /\.(pdf|zip|tar|gz|rar|exe|dmg|pkg|deb|rpm|mp4|avi|mov)$/i,
      /\?.*=/, // skip URLs with query params for now
      /#/,     // skip hash anchors
      /\/api\//,
      /\/admin\//,
      /\/auth\//,
      /logout/i,
    ];
    return skipPatterns.some((pattern) => pattern.test(url));
  }

  // ── Save Crawled Page ────────────────────────────────────────────────
  private async saveCrawledPage(crawlJobId: string, result: CrawledPageResult) {
    await this.prisma.crawledPage.create({
      data: {
        crawlJobId,
        url: result.url,
        path: result.path,
        title: result.title,
        html: result.html.substring(0, 500000), // Increased limit to 500KB
        markdown: result.markdown.substring(0, 100000), // Increased to 100KB
        links: result.links,
        images: result.images as any,
        forms: result.forms as any,
        headers: result.metadata as any,
        statusCode: result.statusCode,
      },
    });
  }

  // ── Simple HTML→Markdown ─────────────────────────────────────────────
  private htmlToMarkdown(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 50000);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
