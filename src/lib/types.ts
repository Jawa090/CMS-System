// API Response Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  siteUrl: string;
  slug: string;
  faviconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  path: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isHomepage: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  id: string;
  pageId: string;
  type: string;
  name: string;
  key: string;
  value: string;
  valueType: string;
  order: number;
  isEditable: boolean;
}

export interface CrawlJob {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'CANCELLED';
  startUrl: string;
  pagesFound: number;
  pagesCrawled: number;
  pagesSkipped: number;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface SeoMetadata {
  id: string;
  pageId: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  canonical: string | null;
  robots: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string;
  twitterCard: string;
  twitterTitle: string | null;
  twitterDesc: string | null;
  twitterImage: string | null;
  jsonLd: any;
  seoScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeoScore {
  score: number;
  issues: string[];
  passed: string[];
  total: number;
}
