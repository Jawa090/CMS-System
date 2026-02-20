import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq'; // REMOVED - No Redis
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { CrawlerQueueService } from './crawler-queue.service';
// import { CrawlWorker } from './workers/crawl.worker'; // REMOVED - No queue
// import { AiModule } from '../ai/ai.module'; // REMOVED - Optional

@Module({
  imports: [
    // AiModule, // REMOVED
    // BullModule.registerQueue(...), // REMOVED - No Redis
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, CrawlerQueueService],
  exports: [CrawlerService, CrawlerQueueService],
})
export class CrawlerModule {}
