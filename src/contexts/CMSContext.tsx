import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCMSContent } from '@/hooks/useCMSContent';
import { useLocation } from 'react-router-dom';

interface CMSContextType {
  getContent: (key: string, defaultValue?: string) => string;
  getContentObject: () => Record<string, string>;
  loading: boolean;
  error: Error | null;
  seo: any;
  data: any;
}

const CMSContext = createContext<CMSContextType | null>(null);

// Declare global window type
declare global {
  interface Window {
    cms: {
      get: (key: string, defaultValue?: string) => string;
      getAll: () => Record<string, string>;
      seo: any;
    };
  }
}

export function CMSProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const cms = useCMSContent({ 
    path: location.pathname,
    enabled: true 
  });

  // Auto-replace content in DOM + Make CMS globally available + SEO
  useEffect(() => {
    if (cms.loading) return;

    const content = cms.getContentObject();
    
    // AUTOMATIC CONTENT REPLACEMENT
    if (cms.data && Object.keys(content).length > 0) {
      // Wait for DOM to be ready
      setTimeout(() => {
        // Auto-replace by element type and index (h1_1, p_1, etc.)
        const elementTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'span', 'li'];
        
        elementTypes.forEach((tag) => {
          const elements = document.querySelectorAll(`${tag}:not([data-cms-skip])`);
          elements.forEach((element, index) => {
            const key = `${tag}_${index + 1}`;
            if (content[key]) {
              // Skip if element contains images or is empty
              const hasImages = element.querySelector('img, svg');
              const hasOnlyWhitespace = element.textContent?.trim() === '';
              
              if (!hasImages && !hasOnlyWhitespace) {
                element.textContent = content[key];
              }
            }
          });
        });

        // Also handle elements with data-cms attribute
        document.querySelectorAll('[data-cms]').forEach((element) => {
          const key = element.getAttribute('data-cms');
          if (key && content[key]) {
            element.textContent = content[key];
          }
        });

        console.log('✅ CMS loaded for:', location.pathname);
        console.log('🔑 Available keys:', Object.keys(content));
        console.log('🎨 Auto content replacement complete!');
      }, 100);
    }
    
    // AUTO SEO META TAGS UPDATE
    if (cms.seo) {
      // Update page title
      if (cms.seo.title) {
        document.title = cms.seo.title;
      }
      
      // Update or create meta tags
      const updateMetaTag = (name: string, content: string, isProperty = false) => {
        if (!content) return;
        
        const attribute = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
      };
      
      // Standard meta tags
      updateMetaTag('description', cms.seo.description);
      updateMetaTag('keywords', cms.seo.keywords?.join(', '));
      updateMetaTag('robots', cms.seo.robots || 'index, follow');
      
      // Open Graph tags
      updateMetaTag('og:title', cms.seo.title || cms.data?.title, true);
      updateMetaTag('og:description', cms.seo.description, true);
      updateMetaTag('og:image', cms.seo.ogImage, true);
      updateMetaTag('og:url', window.location.href, true);
      updateMetaTag('og:type', 'website', true);
      
      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', cms.seo.title || cms.data?.title);
      updateMetaTag('twitter:description', cms.seo.description);
      updateMetaTag('twitter:image', cms.seo.ogImage);
      
      // Canonical URL
      if (cms.seo.canonical) {
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = cms.seo.canonical;
      }
      
      console.log('🔍 SEO meta tags updated!');
    }
    
    // Make CMS globally available
    if (cms.data) {
      window.cms = {
        get: cms.getContent,
        getAll: cms.getContentObject,
        seo: cms.seo
      };
    } else {
      window.cms = {
        get: (key: string, defaultValue = '') => defaultValue,
        getAll: () => ({}),
        seo: {}
      };
    }
  }, [cms.loading, cms.data, cms.seo, location.pathname, cms.getContent, cms.getContentObject]);

  return (
    <CMSContext.Provider value={cms}>
      {cms.loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </CMSContext.Provider>
  );
}

// Custom hook to use CMS content in any component
export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within CMSProvider');
  }
  return context;
}

// Helper component for conditional CMS content
export function CMSContent({ 
  contentKey, 
  defaultValue = '',
  className = '' 
}: { 
  contentKey: string; 
  defaultValue?: string;
  className?: string;
}) {
  const { getContent } = useCMS();
  return <span className={className}>{getContent(contentKey, defaultValue)}</span>;
}
