import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all background jobs' })
  async listJobs() {
    return this.jobsService.listAllJobs();
  }

  @Get(':queue/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get queue statistics' })
  async queueStats(@Param('queue') queue: string) {
    return this.jobsService.getQueueStats(queue);
  }

  @Get(':queue/failed')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get failed jobs in a queue' })
  async failedJobs(@Param('queue') queue: string) {
    return this.jobsService.getFailedJobs(queue);
  }
}
