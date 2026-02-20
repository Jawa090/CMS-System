import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('Pages')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard) // REMOVED
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page manually' })
  async createPage(@Body() dto: CreatePageDto) {
    return this.pagesService.createPage(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List all pages for a project' })
  @ApiQuery({ name: 'status', required: false })
  async listPages(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.pagesService.findAllByProject(projectId, status);
  }

  @Get('by-path')
  @ApiOperation({ summary: 'Get page by path for live site' })
  @ApiQuery({ name: 'path', required: true })
  @ApiQuery({ name: 'projectId', required: false })
  async getPageByPath(
    @Query('path') path: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.pagesService.findByPath(path, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page with all content blocks' })
  async getPage(@Param('id') id: string) {
    return this.pagesService.findOneWithContent(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update page metadata' })
  async updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a page' })
  async publishPage(@Param('id') id: string) {
    // userId removed - no auth
    return this.pagesService.publish(id, 'system');
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a page' })
  async unpublishPage(@Param('id') id: string) {
    return this.pagesService.unpublish(id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history for a page' })
  async getVersions(@Param('id') id: string) {
    return this.pagesService.getVersions(id);
  }

  @Post(':id/rollback/:version')
  @ApiOperation({ summary: 'Rollback page to a specific version' })
  async rollback(
    @Param('id') id: string,
    @Param('version') version: number,
  ) {
    // userId removed - no auth
    return this.pagesService.rollback(id, Number(version), 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page' })
  async deletePage(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }
}
