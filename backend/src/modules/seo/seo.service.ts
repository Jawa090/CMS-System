import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSeoDto } from './dto/update-seo.dto';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async findByPage(pageId: string) {
    const seo = await this.prisma.seoMetadata.findUnique({ where: { pageId } });
    if (!seo) throw new NotFoundException('SEO metadata not found');
    return seo;
  }

  async update(pageId: string, dto: UpdateSeoDto) {
    const score = this.computeScore(dto);
    return this.prisma.seoMetadata.upsert({
      where: { pageId },
      create: { pageId, ...dto, seoScore: score, keywords: dto.keywords ?? [] },
      update: { ...dto, seoScore: score },
    });
  }

  async calculateScore(pageId: string) {
    const seo = await this.findByPage(pageId);
    const score = this.computeScore(seo as any);
    const issues: string[] = [];
    const passed: string[] = [];

    if (seo.title && seo.title.length <= 60) passed.push('Title OK');
    else issues.push('Title missing or too long (>60 chars)');

    if (seo.description && seo.description.length <= 160) passed.push('Meta description OK');
    else issues.push('Meta description missing or too long (>160 chars)');

    if (seo.ogTitle) passed.push('OG title present');
    else issues.push('Missing og:title');

    if (seo.ogImage) passed.push('OG image present');
    else issues.push('Missing og:image');

    if (seo.canonical) passed.push('Canonical URL present');
    else issues.push('Missing canonical URL');

    return { score, issues, passed, total: issues.length + passed.length };
  }

  async projectOverview(projectId: string) {
    const pages = await this.prisma.page.findMany({
      where: { projectId },
      include: { seoMetadata: true },
    });

    return pages.map((page) => ({
      pageId: page.id,
      path: page.path,
      title: page.title,
      seoScore: page.seoMetadata?.seoScore ?? 0,
      hasDescription: !!page.seoMetadata?.description,
      hasOgImage: !!page.seoMetadata?.ogImage,
    }));
  }

  private computeScore(seo: Partial<UpdateSeoDto>): number {
    let score = 0;
    if (seo.title) score += seo.title.length <= 60 ? 25 : 10;
    if (seo.description) score += seo.description.length <= 160 ? 25 : 10;
    if (seo.ogTitle) score += 10;
    if (seo.ogImage) score += 15;
    if (seo.canonical) score += 10;
    if (seo.keywords && seo.keywords.length > 0) score += 5;
    if (seo.twitterCard) score += 5;
    if (seo.jsonLd) score += 5;
    return Math.min(score, 100);
  }
}
