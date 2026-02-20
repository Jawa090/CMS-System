import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
import { ContentBlocksService } from './content-blocks.service';
import { UpdateContentBlockDto } from './dto/update-content-block.dto';
import { BulkUpdateContentBlocksDto } from './dto/bulk-update-content-blocks.dto';

@ApiTags('Content Blocks')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard) // REMOVED
@Controller('content-blocks')
export class ContentBlocksController {
  constructor(private readonly service: ContentBlocksService) {}

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Get all content blocks for a page' })
  async getByPage(@Param('pageId') pageId: string) {
    return this.service.findByPage(pageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single content block' })
  async getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a content block value' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentBlockDto,
  ) {
    return this.service.update(id, dto);
  }

  @Put('page/:pageId/bulk')
  @ApiOperation({ summary: 'Bulk update multiple content blocks at once' })
  async bulkUpdate(
    @Param('pageId') pageId: string,
    @Body() dto: BulkUpdateContentBlocksDto,
  ) {
    return this.service.bulkUpdate(pageId, dto.blocks);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a content block' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
