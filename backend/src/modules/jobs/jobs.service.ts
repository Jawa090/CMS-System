import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CRAWL_QUEUE, AI_ANALYSIS_QUEUE } from '../crawler/crawler-queue.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(CRAWL_QUEUE) private crawlQueue: Queue,
    @InjectQueue(AI_ANALYSIS_QUEUE) private aiQueue: Queue,
  ) {}

  async listAllJobs() {
    const [crawlActive, crawlWaiting, aiActive, aiWaiting] = await Promise.all([
      this.crawlQueue.getActive(),
      this.crawlQueue.getWaiting(),
      this.aiQueue.getActive(),
      this.aiQueue.getWaiting(),
    ]);

    return {
      crawlQueue: { active: crawlActive.length, waiting: crawlWaiting.length },
      aiQueue: { active: aiActive.length, waiting: aiWaiting.length },
    };
  }

  async getQueueStats(queueName: string) {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    return { queueName, waiting, active, completed, failed, delayed };
  }

  async getFailedJobs(queueName: string) {
    const queue = this.getQueue(queueName);
    const failed = await queue.getFailed();
    return failed.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
    }));
  }

  private getQueue(name: string): Queue {
    if (name === 'crawl-queue') return this.crawlQueue;
    if (name === 'ai-analysis-queue') return this.aiQueue;
    throw new Error(`Unknown queue: ${name}`);
  }
}
