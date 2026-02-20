import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CRAWL_QUEUE, AI_ANALYSIS_QUEUE } from './crawler-queue.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Processor(CRAWL_QUEUE)
export class CrawlWorker extends WorkerHost {
  private readonly logger = new Logger(CrawlWorker.name);

  constructor(
    private crawlerService: CrawlerService,
    private aiService: AiService,
    private prisma: PrismaService,
    @InjectQueue(AI_ANALYSIS_QUEUE) private aiQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    const { crawlJobId, url, options } = job.data;
    this.logger.log(`Processing crawl job ${crawlJobId} for ${url}`);

    try {
      // Update progress
      await job.updateProgress(5);

      // Execute the crawl
      await this.crawlerService.crawlSite(crawlJobId, url, options);

      await job.updateProgress(70);

      // Queue AI analysis for each crawled page
      const pages = await this.prisma.crawledPage.findMany({
        where: { crawlJobId },
        select: { id: true, html: true, path: true },
      });

      await job.updateProgress(75);

      // Queue AI analysis jobs
      for (const page of pages) {
        await this.aiQueue.add('analyze-page', {
          crawlJobId,
          crawledPageId: page.id,
          projectId: job.data.projectId,
          path: page.path,
        }, { attempts: 2 });
      }

      await job.updateProgress(100);
      this.logger.log(`✅ Crawl job ${crawlJobId} complete. ${pages.length} pages queued for AI analysis.`);
      return { pagesFound: pages.length };
    } catch (err) {
      this.logger.error(`Crawl job ${crawlJobId} failed: ${err.message}`);
      throw err;
    }
  }
}
