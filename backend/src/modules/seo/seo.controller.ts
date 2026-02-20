import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
import { SeoService } from './seo.service';
import { UpdateSeoDto } from './dto/update-seo.dto';

@ApiTags('SEO')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard) // REMOVED
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get(':pageId')
  @ApiOperation({ summary: 'Get SEO metadata for a page' })
  async getSeo(@Param('pageId') pageId: string) {
    return this.seoService.findByPage(pageId);
  }

  @Put(':pageId')
  @ApiOperation({ summary: 'Update SEO metadata for a page' })
  async updateSeo(@Param('pageId') pageId: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.update(pageId, dto);
  }

  @Get(':pageId/score')
  @ApiOperation({ summary: 'Calculate and return SEO score for a page' })
  async getSeoScore(@Param('pageId') pageId: string) {
    return this.seoService.calculateScore(pageId);
  }

  @Get('project/:projectId/overview')
  @ApiOperation({ summary: 'SEO overview for all pages in a project' })
  async seoOverview(@Param('projectId') projectId: string) {
    return this.seoService.projectOverview(projectId);
  }
}
