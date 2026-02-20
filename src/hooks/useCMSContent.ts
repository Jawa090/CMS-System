import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ContentBlock {
  id: string;
  key: string;
  value: string;
  valueType: string;
  type: string;
  name: string;
}

interface PageData {
  id: string;
  path: string;
  title: string;
  contentBlocks: ContentBlock[];
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
    robots?: string;
  };
}

interface UseCMSContentOptions {
  path: string;
  projectId?: string;
  enabled?: boolean;
}

export function useCMSContent({ path, projectId, enabled = true }: UseCMSContentOptions) {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching CMS content for path:', path);
        console.log('🔗 API URL:', API_URL);
        
        const url = new URL(`${API_URL}/pages/by-path`);
        url.searchParams.append('path', path);
        if (projectId) {
          url.searchParams.append('projectId', projectId);
        }

        console.log('📡 Fetching from:', url.toString());
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const pageData = await response.json();
        console.log('✅ CMS data loaded:', pageData);
        setData(pageData);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('❌ CMS Content Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [path, projectId, enabled]);

  // Helper function to get content by key
  const getContent = (key: string, defaultValue: string = '') => {
    const block = data?.contentBlocks.find(b => b.key === key);
    return block?.value || defaultValue;
  };

  // Helper function to get all content as object
  const getContentObject = () => {
    if (!data) return {};
    return data.contentBlocks.reduce((acc, block) => {
      acc[block.key] = block.value;
      return acc;
    }, {} as Record<string, string>);
  };

  return {
    data,
    loading,
    error,
    getContent,
    getContentObject,
    seo: data?.seoMetadata,
  };
}
