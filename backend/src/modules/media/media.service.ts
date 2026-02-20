import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async upload(projectId: string, file: Express.Multer.File) {
    const uploadDir = this.config.get('STORAGE_LOCAL_PATH', './uploads');
    const projectDir = path.join(uploadDir, projectId);

    // Ensure directory exists
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(projectDir, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/${projectId}/${filename}`;

    const media = await this.prisma.mediaFile.create({
      data: {
        projectId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        storageType: 'local',
        storagePath: filePath,
      },
    });

    this.logger.log(`Uploaded file: ${filename} for project ${projectId}`);
    return media;
  }

  async findByProject(projectId: string) {
    return this.prisma.mediaFile.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(id: string) {
    const file = await this.prisma.mediaFile.findUniqueOrThrow({ where: { id } });

    // Delete from filesystem
    try {
      if (fs.existsSync(file.storagePath)) fs.unlinkSync(file.storagePath);
    } catch (err) {
      this.logger.warn(`Could not delete file from disk: ${err.message}`);
    }

    await this.prisma.mediaFile.delete({ where: { id } });
    return { message: 'File deleted' };
  }
}
