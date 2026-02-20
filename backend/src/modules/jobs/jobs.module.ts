import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CRAWL_QUEUE, AI_ANALYSIS_QUEUE } from '../crawler/crawler-queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: CRAWL_QUEUE },
      { name: AI_ANALYSIS_QUEUE },
    ),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
