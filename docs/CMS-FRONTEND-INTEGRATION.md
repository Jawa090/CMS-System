# CMS Frontend Integration Guide

## 📋 Overview
Yeh guide aapko batayega ke kaise apni actual website mein CMS integration add karein.

## 🗂️ Files to Copy

### 1. Create `src/hooks/useCMSContent.ts`

```typescript
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
        
        const url = new URL(`${API_URL}/pages/by-path`);
        url.searchParams.append('path', path);
        if (projectId) {
          url.searchParams.append('projectId', projectId);
        }
        
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

  const getContent = (key: string, defaultValue: string = '') => {
    const block = data?.contentBlocks.find(b => b.key === key);
    return block?.value || defaultValue;
  };

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
```

### 2. Create `src/contexts/CMSContext.tsx`

```typescript
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

  useEffect(() => {
    if (!cms.loading && cms.data) {
      window.cms = {
        get: cms.getContent,
        getAll: cms.getContentObject,
        seo: cms.seo
      };
    } else if (!cms.loading && !cms.data) {
      window.cms = {
        get: (key: string, defaultValue = '') => defaultValue,
        getAll: () => ({}),
        seo: {}
      };
    }
  }, [cms, location.pathname]);

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

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within CMSProvider');
  }
  return context;
}

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
```

### 3. Update your `.env` file

```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 4. Update your main `App.tsx` or `main.tsx`

Wrap your app with CMSProvider:

```typescript
import { CMSProvider } from './contexts/CMSContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <CMSProvider>
        {/* Your existing app routes */}
      </CMSProvider>
    </BrowserRouter>
  );
}
```

## 🎨 Usage Examples

### Method 1: Using Hook in Component

```typescript
import { useCMS } from '@/contexts/CMSContext';

function PricingPage() {
  const { getContent } = useCMS();
  
  return (
    <div>
      <h1>{getContent('pricing.title', 'Default Pricing Title')}</h1>
      <p>{getContent('pricing.description', 'Default description')}</p>
    </div>
  );
}
```

### Method 2: Using CMSContent Component

```typescript
import { CMSContent } from '@/contexts/CMSContext';

function AboutPage() {
  return (
    <div>
      <h1>
        <CMSContent 
          contentKey="about.title" 
          defaultValue="About Us" 
        />
      </h1>
      <p>
        <CMSContent 
          contentKey="about.description" 
          defaultValue="Learn more about us" 
        />
      </p>
    </div>
  );
}
```

### Method 3: Using window.cms (Browser Console)

```javascript
// Get single content
window.cms.get('pricing.title')

// Get all content
window.cms.getAll()

// Get SEO data
window.cms.seo
```

## 🔧 How Content Keys Work

Content keys are automatically generated from your HTML structure during crawling:

### Example HTML:
```html
<h1 id="hero-title">Welcome to Our Site</h1>
<p class="description">This is our description</p>
```

### Generated Keys:
- `hero-title` → from id attribute
- `description` → from class attribute
- Auto-generated keys for elements without id/class

### In Dashboard:
1. Go to Pages → Select page → Edit
2. You'll see all content blocks with their keys
3. Edit the values
4. Save changes
5. Your frontend will automatically fetch updated content

## 🚀 Complete Workflow

### 1. Crawl Your Site
```
Dashboard → Crawler → Enter URL → Start Crawl
```

### 2. View Pages
```
Dashboard → Pages → Select Project
```

### 3. Edit Content
```
Select Page → Edit → Modify content blocks → Save
```

### 4. Frontend Auto-Updates
Your React app will automatically fetch and display the updated content!

## 🎯 Key Benefits

✅ **No Code Changes Needed** - Edit content without touching code
✅ **Real-time Updates** - Changes reflect immediately
✅ **Type-safe** - Full TypeScript support
✅ **SEO Friendly** - Automatic SEO metadata
✅ **Fallback Support** - Default values if CMS fails
✅ **Global Access** - Use window.cms anywhere

## 🐛 Troubleshooting

### Issue: 404 Error
**Solution:** Make sure you've crawled the page first
```
Dashboard → Crawler → Crawl your site
```

### Issue: Empty Content
**Solution:** Check if content blocks exist
```
Dashboard → Pages → Select page → Check content blocks
```

### Issue: CORS Error
**Solution:** Backend already has CORS enabled, check if backend is running
```bash
cd backend
npm run start:dev
```

### Issue: Content Not Updating
**Solution:** Clear browser cache or hard refresh (Ctrl+Shift+R)

## 📝 Notes

- Content is fetched based on current route path
- Each page has its own content blocks
- Content keys are unique per page
- Default values are shown if CMS fails
- Loading state is handled automatically
