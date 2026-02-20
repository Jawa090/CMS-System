import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateContentBlockDto } from './dto/update-content-block.dto';

@Injectable()
export class ContentBlocksService {
  constructor(private prisma: PrismaService) {}

  async findByPage(pageId: string) {
    return this.prisma.contentBlock.findMany({
      where: { pageId },
      include: { component: true, editedBy: { select: { firstName: true, lastName: true } } },
      orderBy: [{ component: { order: 'asc' } }, { order: 'asc' }],
    });
  }

  async findOne(id: string) {
    const block = await this.prisma.contentBlock.findUnique({
      where: { id },
      include: { page: true, component: true },
    });
    if (!block) throw new NotFoundException(`Content block ${id} not found`);
    return block;
  }

  async update(id: string, dto: UpdateContentBlockDto) {
    await this.findOne(id);
    return this.prisma.contentBlock.update({
      where: { id },
      data: {
        value: dto.value,
        lastEditedAt: new Date(),
        editedById: dto.editedById,
        metadata: dto.metadata as any,
      },
    });
  }

  async bulkUpdate(pageId: string, blocks: Array<{ id: string; value: string }>) {
    const results = await Promise.allSettled(
      blocks.map((block) =>
        this.prisma.contentBlock.update({
          where: { id: block.id, pageId },  // ensures ownership
          data: { value: block.value, lastEditedAt: new Date() },
        }),
      ),
    );

    const updated = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { updated, failed, total: blocks.length };
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.contentBlock.delete({ where: { id } });
    return { message: 'Content block deleted' };
  }
}
