import { Controller, Get, Post, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // REMOVED
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Media')
// @ApiBearerAuth() // REMOVED
// @UseGuards(JwtAuthGuard) // REMOVED
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to the media library' })
  async upload(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.upload(projectId, file);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List all media files for a project' })
  async listFiles(@Param('projectId') projectId: string) {
    return this.mediaService.findByProject(projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  async deleteFile(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
