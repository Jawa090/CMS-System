import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard) // REMOVED
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get analytics overview for a project' })
  async projectOverview(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectOverview(projectId);
  }

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Get analytics for a specific page' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async pageAnalytics(
    @Param('pageId') pageId: string,
    @Query('days') days = 30,
  ) {
    return this.analyticsService.getPageAnalytics(pageId, Number(days));
  }
}
