import {
  Controller, Post, Get, Param, Delete, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
// import { RolesGuard } from '../auth/guards/roles.guard'; // REMOVED
// import { Roles } from '../auth/decorators/roles.decorator'; // REMOVED
import { CrawlerQueueService } from './crawler-queue.service';
import { StartCrawlDto } from './dto/start-crawl.dto';

@ApiTags('Crawler')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard, RolesGuard) // REMOVED
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly queueService: CrawlerQueueService) {}

  @Post('start')
  // @Roles('ADMIN', 'EDITOR') // REMOVED
  @ApiOperation({ summary: 'Start crawling a React site' })
  async startCrawl(@Body() dto: StartCrawlDto) {
    // userId removed - no auth
    return this.queueService.queueCrawlJob(dto, 'system');
  }

  @Post(':jobId/stop')
  // @Roles('ADMIN') // REMOVED
  @ApiOperation({ summary: 'Stop a running crawl job' })
  async stopCrawl(@Param('jobId') jobId: string) {
    return this.queueService.stopCrawlJob(jobId);
  }

  @Get('jobs/:projectId')
  @ApiOperation({ summary: 'List crawl jobs for a project' })
  async listJobs(@Param('projectId') projectId: string) {
    return this.queueService.getJobsForProject(projectId);
  }

  @Get('jobs/:jobId/status')
  @ApiOperation({ summary: 'Get crawl job status and progress' })
  async jobStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  @Get('jobs/:jobId/pages')
  @ApiOperation({ summary: 'Get pages discovered in a crawl job' })
  async jobPages(@Param('jobId') jobId: string) {
    return this.queueService.getJobPages(jobId);
  }

  @Delete('jobs/:jobId')
  // @Roles('ADMIN') // REMOVED
  @ApiOperation({ summary: 'Delete a crawl job and its data' })
  async deleteJob(@Param('jobId') jobId: string) {
    return this.queueService.deleteJob(jobId);
  }
}
