import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private prisma: PrismaService) {}

  async createPage(dto: CreatePageDto) {
    const { projectId, path, title, slug, isHomepage, template } = dto;

    // Generate slug if not provided
    const pageSlug = slug || path.replace(/^\//, '').replace(/\//g, '-') || 'page';

    // Create page
    const page = await this.prisma.page.create({
      data: {
        projectId,
        path,
        title,
        slug: pageSlug,
        isHomepage: isHomepage || false,
        status: 'DRAFT',
      },
    });

    this.logger.log(`Created new page: ${path} (${page.id})`);

    // Generate default content blocks based on template
    if (template) {
      await this.generateTemplateBlocks(page.id, template, title);
      this.logger.log(`Generated ${template} template blocks for page ${page.id}`);
    }

    return page;
  }

  private async generateTemplateBlocks(pageId: string, template: string, pageTitle: string) {
    const blocks: any[] = [];
    let order = 0;

    if (template === 'location') {
      // Location Page Template
      blocks.push(
        // Hero Section
        { pageId, type: 'IMAGE', name: 'Hero Background Image', key: 'image_hero', value: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Construction site hero image', position: 'hero' } },
        { pageId, type: 'HEADING', name: 'Hero Title', key: 'h1_1', value: pageTitle, valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Hero Subtitle', key: 'p_1', value: 'Professional construction estimating services in your area', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // About Section
        { pageId, type: 'HEADING', name: 'About Section Title', key: 'h2_1', value: 'About Our Services', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'IMAGE', name: 'About Section Image', key: 'image_about', value: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Team working on construction estimates', position: 'about' } },
        { pageId, type: 'TEXT', name: 'About Description', key: 'p_2', value: 'We provide comprehensive construction estimating services for residential, commercial, and industrial projects. Our experienced team delivers accurate estimates that help you plan and budget effectively.', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // Why Choose Us
        { pageId, type: 'HEADING', name: 'Why Choose Us Title', key: 'h2_2', value: 'Why Choose Us?', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Benefit 1', key: 'li_1', value: 'Fast turnaround times', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Benefit 2', key: 'li_2', value: 'Accurate and detailed estimates', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Benefit 3', key: 'li_3', value: 'Experienced estimators', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Benefit 4', key: 'li_4', value: 'Competitive pricing', valueType: 'TEXT', order: order++, isEditable: true },
        
        // Services Section
        { pageId, type: 'HEADING', name: 'Services Title', key: 'h2_3', value: 'Our Service Areas', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Services Description', key: 'p_3', value: 'We serve contractors, builders, and property owners throughout the region. Whether you\'re planning a small renovation or a large-scale commercial project, we have the expertise to provide accurate estimates.', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // CTA Section
        { pageId, type: 'HEADING', name: 'CTA Title', key: 'h2_4', value: 'Get Your Free Estimate', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'CTA', name: 'CTA Button', key: 'button_1', value: 'Contact Us Now', valueType: 'TEXT', order: order++, isEditable: true },
        
        // What We Estimate
        { pageId, type: 'HEADING', name: 'What We Estimate Title', key: 'h2_5', value: 'What We Estimate', valueType: 'TEXT', order: order++, isEditable: true },
        
        // Residential
        { pageId, type: 'IMAGE', name: 'Residential Image', key: 'image_residential', value: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Residential construction', position: 'service' } },
        { pageId, type: 'HEADING', name: 'Residential Title', key: 'h3_1', value: 'Residential', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Residential Description', key: 'p_4', value: 'Home renovations, additions, and new construction projects', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // Commercial
        { pageId, type: 'IMAGE', name: 'Commercial Image', key: 'image_commercial', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Commercial building', position: 'service' } },
        { pageId, type: 'HEADING', name: 'Commercial Title', key: 'h3_2', value: 'Commercial', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Commercial Description', key: 'p_5', value: 'Office buildings, retail spaces, and commercial developments', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // Industrial
        { pageId, type: 'IMAGE', name: 'Industrial Image', key: 'image_industrial', value: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Industrial facility', position: 'service' } },
        { pageId, type: 'HEADING', name: 'Industrial Title', key: 'h3_3', value: 'Industrial', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Industrial Description', key: 'p_6', value: 'Warehouses, manufacturing facilities, and industrial complexes', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        
        // Final CTA
        { pageId, type: 'HEADING', name: 'Final CTA Title', key: 'h2_6', value: 'Ready to Get Started?', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Final CTA Text', key: 'p_7', value: 'Contact us today for a free consultation and estimate', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        { pageId, type: 'CTA', name: 'Final CTA Button', key: 'button_2', value: 'Get Free Quote', valueType: 'TEXT', order: order++, isEditable: true },
      );
    } else if (template === 'service') {
      // Service Page Template
      blocks.push(
        { pageId, type: 'IMAGE', name: 'Service Hero Image', key: 'image_hero', value: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Service hero image', position: 'hero' } },
        { pageId, type: 'HEADING', name: 'Service Title', key: 'h1_1', value: pageTitle, valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Service Description', key: 'p_1', value: 'Professional service description goes here', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        { pageId, type: 'IMAGE', name: 'Features Image', key: 'image_features', value: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Service features', position: 'content' } },
        { pageId, type: 'HEADING', name: 'Features Title', key: 'h2_1', value: 'Key Features', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Feature 1', key: 'li_1', value: 'Feature one description', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Feature 2', key: 'li_2', value: 'Feature two description', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Feature 3', key: 'li_3', value: 'Feature three description', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'HEADING', name: 'Benefits Title', key: 'h2_2', value: 'Benefits', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Benefits Description', key: 'p_2', value: 'Discover the advantages of our service', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        { pageId, type: 'CTA', name: 'CTA Button', key: 'button_1', value: 'Get Started', valueType: 'TEXT', order: order++, isEditable: true },
      );
    } else {
      // Basic Page Template
      blocks.push(
        { pageId, type: 'IMAGE', name: 'Page Header Image', key: 'image_header', value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', valueType: 'URL', order: order++, isEditable: true, metadata: { alt: 'Page header image', position: 'header' } },
        { pageId, type: 'HEADING', name: 'Page Title', key: 'h1_1', value: pageTitle, valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Introduction', key: 'p_1', value: 'Add your content here', valueType: 'LONG_TEXT', order: order++, isEditable: true },
        { pageId, type: 'HEADING', name: 'Section 1', key: 'h2_1', value: 'Section Heading', valueType: 'TEXT', order: order++, isEditable: true },
        { pageId, type: 'TEXT', name: 'Section Content', key: 'p_2', value: 'Section content goes here', valueType: 'LONG_TEXT', order: order++, isEditable: true },
      );
    }

    // Create all blocks
    if (blocks.length > 0) {
      await this.prisma.contentBlock.createMany({ data: blocks });
    }

    // Create SEO metadata
    await this.prisma.seoMetadata.create({
      data: {
        pageId,
        title: pageTitle,
        description: `Learn more about ${pageTitle}`,
        robots: 'index, follow',
      },
    });
  }

  async findAllByProject(projectId: string, status?: string) {
    return this.prisma.page.findMany({
      where: { projectId, ...(status ? { status: status as any } : {}) },
      include: {
        seoMetadata: { select: { seoScore: true, title: true, description: true } },
        _count: { select: { contentBlocks: true, components: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByPath(path: string, projectId?: string) {
    const where: any = { path };
    if (projectId) {
      where.projectId = projectId;
    }

    const page = await this.prisma.page.findFirst({
      where,
      include: {
        seoMetadata: true,
        contentBlocks: { 
          orderBy: { order: 'asc' },
          select: {
            id: true,
            key: true,
            value: true,
            valueType: true,
            type: true,
            name: true,
          }
        },
        project: {
          select: {
            name: true,
            siteUrl: true,
          }
        }
      },
    });

    if (!page) {
      throw new NotFoundException(`Page not found for path: ${path}`);
    }

    return page;
  }

  async findOneWithContent(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        seoMetadata: true,
        components: {
          include: { contentBlocks: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        contentBlocks: { orderBy: { order: 'asc' } },
      },
    });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOneOrThrow(id);
    return this.prisma.page.update({ where: { id }, data: dto as any });
  }

  async publish(id: string, userId: string) {
    const page = await this.findOneOrThrow(id);

    // Save version snapshot before publishing
    await this.createVersionSnapshot(page.id, userId);

    return this.prisma.page.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), editCount: { increment: 1 } },
    });
  }

  async unpublish(id: string) {
    return this.prisma.page.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null },
    });
  }

  async getVersions(pageId: string) {
    return this.prisma.versionHistory.findMany({
      where: { pageId },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { version: 'desc' },
    });
  }

  async rollback(pageId: string, version: number, userId: string) {
    const snapshot = await this.prisma.versionHistory.findUnique({
      where: { pageId_version: { pageId, version } },
    });
    if (!snapshot) throw new NotFoundException(`Version ${version} not found`);

    const snapshotData = snapshot.snapshot as any;

    // Restore content blocks from snapshot
    if (snapshotData.contentBlocks) {
      for (const block of snapshotData.contentBlocks) {
        await this.prisma.contentBlock.update({
          where: { id: block.id },
          data: { value: block.value, updatedAt: new Date() },
        });
      }
    }

    // Create a new version entry recording the rollback
    const latestVersion = await this.prisma.versionHistory.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' },
    });

    await this.prisma.versionHistory.create({
      data: {
        pageId,
        version: (latestVersion?.version ?? 0) + 1,
        snapshot: snapshotData,
        changesSummary: `Rolled back to version ${version}`,
        createdById: userId,
        restoredFrom: snapshot.id,
      },
    });

    return { message: `Rolled back to version ${version}` };
  }

  async delete(id: string) {
    await this.findOneOrThrow(id);
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Page deleted' };
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  private async findOneOrThrow(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async createVersionSnapshot(pageId: string, userId: string) {
    const page = await this.findOneWithContent(pageId);
    const latestVersion = await this.prisma.versionHistory.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' },
    });

    await this.prisma.versionHistory.create({
      data: {
        pageId,
        version: (latestVersion?.version ?? 0) + 1,
        snapshot: page as any,
        changesSummary: `Auto-snapshot before publish`,
        createdById: userId,
      },
    });
  }
}
