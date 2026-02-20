import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    const slug = this.generateSlug(dto.name);
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Project slug already exists');

    return this.prisma.project.create({ data: { ...dto, slug } });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        _count: { select: { pages: true, crawlJobs: true, mediaFiles: true } },
        crawlJobs: {
          orderBy: { queuedAt: 'desc' },
          take: 1,
          select: { status: true, completedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { pages: true, crawlJobs: true, mediaFiles: true } } },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted' };
  }

  async getStats(id: string) {
    await this.findOne(id);

    const [pages, components, blocks, jobs, media] = await Promise.all([
      this.prisma.page.count({ where: { projectId: id } }),
      this.prisma.pageComponent.count({ where: { page: { projectId: id } } }),
      this.prisma.contentBlock.count({ where: { page: { projectId: id } } }),
      this.prisma.crawlJob.count({ where: { projectId: id } }),
      this.prisma.mediaFile.count({ where: { projectId: id } }),
    ]);

    return { pages, components, blocks, jobs, media };
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
