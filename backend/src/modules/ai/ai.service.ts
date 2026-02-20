// ================================================================
//  AI SERVICE — Content segmentation, component detection,
//  CMS schema generation using OpenAI
// ================================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ContentBlock {
  key: string;
  name: string;
  type: string;
  value: string;
  valueType: string;
  order: number;
}

export interface DetectedComponent {
  name: string;
  type: string;
  selector?: string;
  aiConfidence: number;
  contentBlocks: ContentBlock[];
}

export interface PageAnalysisResult {
  pageType: string;
  components: DetectedComponent[];
  seoData: SeoExtraction;
  contentBlocks: ContentBlock[];
  schema: CmsSchema;
}

export interface SeoExtraction {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
  seoScore: number;
}

export interface CmsSchema {
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'url' | 'json' | 'richtext';
    required: boolean;
    component: string;
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('OPENAI_API_KEY'),
    });
  }

  // ── Analyze Full Page ───────────────────────────────────────────────
  async analyzePage(html: string, url: string): Promise<PageAnalysisResult> {
    this.logger.debug(`Analyzing page: ${url}`);

    // Clean HTML for AI (reduce tokens)
    const cleanedHtml = this.cleanHtmlForAI(html);

    const prompt = `
You are an expert React CMS architect. Analyze this webpage HTML and extract a complete CMS content structure.

URL: ${url}

HTML (truncated):
\`\`\`html
${cleanedHtml}
\`\`\`

Return a JSON response with this EXACT structure:
{
  "pageType": "homepage|blog|about|pricing|contact|landing|product|custom",
  "components": [
    {
      "name": "ComponentName",
      "type": "HERO|NAVBAR|FOOTER|FEATURES|PRICING|TESTIMONIALS|CTA|FORM|TEXT|HEADING|IMAGE|CARD|CUSTOM",
      "selector": "css-selector-or-null",
      "aiConfidence": 0.95,
      "contentBlocks": [
        {
          "key": "hero_heading",
          "name": "Hero Heading",
          "type": "HEADING",
          "value": "actual text content here",
          "valueType": "text|html|image|url|json",
          "order": 0
        }
      ]
    }
  ],
  "seoData": {
    "title": "Page Title",
    "description": "Meta description",
    "keywords": ["keyword1", "keyword2"],
    "canonical": "https://...",
    "ogTitle": "OG Title",
    "ogDescription": "OG Desc",
    "ogImage": "https://image-url",
    "robots": "index, follow",
    "seoScore": 85
  },
  "contentBlocks": [
    {
      "key": "unique_key",
      "name": "Human Readable Name",
      "type": "TEXT|HEADING|IMAGE|CTA",
      "value": "content value",
      "valueType": "text|html|image|url",
      "order": 0
    }
  ],
  "schema": {
    "fields": [
      {
        "key": "field_key",
        "label": "Field Label",
        "type": "text|textarea|image|url|json|richtext",
        "required": true,
        "component": "ComponentName"
      }
    ]
  }
}

Rules:
1. Extract ALL editable content (text, headings, images, buttons, links)
2. Identify React component boundaries
3. Calculate SEO score (0-100) based on meta completeness
4. Generate unique snake_case keys for each field
5. Be thorough but return ONLY valid JSON
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: this.config.get<number>('OPENAI_MAX_TOKENS', 4096),
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as PageAnalysisResult;
    } catch (err) {
      this.logger.error(`AI analysis failed for ${url}: ${err.message}`);
      return this.getFallbackAnalysis(url);
    }
  }

  // ── Generate CMS Schema from Components ────────────────────────────
  async generateCmsSchema(components: DetectedComponent[]): Promise<CmsSchema> {
    const fields: CmsSchema['fields'] = [];

    for (const component of components) {
      for (const block of component.contentBlocks) {
        fields.push({
          key: block.key,
          label: block.name,
          type: this.inferFieldType(block.valueType, block.type),
          required: ['HEADING', 'HERO', 'NAVBAR'].includes(block.type),
          component: component.name,
        });
      }
    }

    return { fields };
  }

  // ── Classify Content Block Type ─────────────────────────────────────
  async classifyBlock(html: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: `Classify this HTML block into one of these types: HERO, NAVBAR, FOOTER, FEATURES, PRICING, TESTIMONIALS, CTA, FORM, TEXT, HEADING, IMAGE, CARD, LIST, FAQ, CUSTOM. Return ONLY the type name.\n\nHTML:\n${html.substring(0, 2000)}`,
      }],
      max_tokens: 20,
      temperature: 0,
    });

    return response.choices[0].message.content?.trim() || 'CUSTOM';
  }

  // ── Extract SEO Data ─────────────────────────────────────────────────
  async extractSeoData(html: string, url: string): Promise<SeoExtraction> {
    // Extract from meta tags directly (no AI needed for raw extraction)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);

    const title = titleMatch?.[1] || '';
    const description = descMatch?.[1] || '';

    // Calculate SEO score
    let score = 0;
    if (title) score += 20;
    if (title.length <= 60) score += 10;
    if (description) score += 20;
    if (description.length <= 160) score += 10;
    if (ogTitleMatch) score += 10;
    if (ogImageMatch) score += 10;
    if (canonicalMatch) score += 10;
    if (html.includes('<h1')) score += 10;

    return {
      title,
      description,
      keywords: [],
      canonical: canonicalMatch?.[1],
      ogTitle: ogTitleMatch?.[1],
      ogDescription: ogDescMatch?.[1],
      ogImage: ogImageMatch?.[1],
      seoScore: score,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  private cleanHtmlForAI(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s{2,}/g, ' ')
      .substring(0, 8000); // Keep within token limits
  }

  private inferFieldType(valueType: string, blockType: string): CmsSchema['fields'][0]['type'] {
    if (valueType === 'image') return 'image';
    if (valueType === 'url') return 'url';
    if (valueType === 'html') return 'richtext';
    if (valueType === 'json') return 'json';
    if (['HERO', 'TEXT', 'TESTIMONIALS'].includes(blockType)) return 'textarea';
    return 'text';
  }

  private getFallbackAnalysis(url: string): PageAnalysisResult {
    return {
      pageType: 'custom',
      components: [],
      seoData: {
        title: '',
        description: '',
        keywords: [],
        seoScore: 0,
      },
      contentBlocks: [],
      schema: { fields: [] },
    };
  }
}
