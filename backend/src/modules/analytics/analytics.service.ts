import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProjectOverview(projectId: string) {
    const pages = await this.prisma.page.findMany({
      where: { projectId },
      select: {
        id: true, title: true, path: true, viewCount: true, editCount: true,
        status: true, publishedAt: true,
        seoMetadata: { select: { seoScore: true } },
      },
      orderBy: { viewCount: 'desc' },
    });

    const totalViews = pages.reduce((sum, p) => sum + p.viewCount, 0);
    const totalEdits = pages.reduce((sum, p) => sum + p.editCount, 0);
    const avgSeoScore = pages.length
      ? Math.round(pages.reduce((sum, p) => sum + (p.seoMetadata?.seoScore ?? 0), 0) / pages.length)
      : 0;

    return {
      totalPages: pages.length,
      publishedPages: pages.filter((p) => p.status === 'PUBLISHED').length,
      totalViews,
      totalEdits,
      avgSeoScore,
      topPages: pages.slice(0, 5),
    };
  }

  async getPageAnalytics(pageId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const analytics = await this.prisma.pageAnalytics.findMany({
      where: { pageId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      select: { title: true, path: true, viewCount: true },
    });

    return { page, analytics, period: `Last ${days} days` };
  }
}
