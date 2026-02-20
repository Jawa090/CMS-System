import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import { AiAnalysisWorker } from './workers/ai-analysis.worker';
import { AI_ANALYSIS_QUEUE } from '../crawler/crawler-queue.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: AI_ANALYSIS_QUEUE }),
  ],
  providers: [AiService, AiAnalysisWorker],
  exports: [AiService],
})
export class AiModule {}
