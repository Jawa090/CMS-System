# 🚀 Live Site Integration Guide

Complete guide to integrate CMS content into your live/local React site.

---

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [Install Dependencies](#install-dependencies)
3. [Add CMS Hook](#add-cms-hook)
4. [Update Your Components](#update-your-components)
5. [Add SEO Meta Tags](#add-seo-meta-tags)
6. [Environment Variables](#environment-variables)

---

## 🎯 Quick Setup

### Step 1: Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

---

## 📦 Step 2: Copy CMS Hook to Your Project

Create this file in your live site:

**File: `src/hooks/useCMSContent.ts`**

```typescript
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_CMS_API_URL || 'http://localhost:3001/api/v1';

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
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDesc?: string;
    twitterImage?: string;
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

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const pageData = await response.json();
        setData(pageData);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('CMS Content Error:', err);
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
```

---

## 🎨 Step 3: Update Your Components

### Example: Home Page Component

**Before (Static Content):**

```tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to My Site</h1>
      <p>This is static content</p>
    </div>
  );
}
```

**After (CMS Content):**

```tsx
import { useCMSContent } from '@/hooks/useCMSContent';

export default function HomePage() {
  const { getContent, loading } = useCMSContent({ 
    path: '/' 
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{getContent('hero_heading', 'Welcome to My Site')}</h1>
      <p>{getContent('hero_description', 'This is static content')}</p>
    </div>
  );
}
```

---

## 🔍 Step 4: Add SEO Meta Tags

Create a SEO component:

**File: `src/components/SEOHead.tsx`**

```tsx
import { Helmet } from 'react-helmet-async';
import { useCMSContent } from '@/hooks/useCMSContent';

interface SEOHeadProps {
  path: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function SEOHead({ path, defaultTitle, defaultDescription }: SEOHeadProps) {
  const { seo } = useCMSContent({ path });

  const title = seo?.title || defaultTitle || 'My Website';
  const description = seo?.description || defaultDescription || '';
  const ogImage = seo?.ogImage || '/default-og-image.jpg';
  const canonical = seo?.canonical || `https://yoursite.com${path}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {seo?.keywords && <meta name="keywords" content={seo.keywords.join(', ')} />}
      <meta name="robots" content={seo?.robots || 'index, follow'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={seo?.ogTitle || title} />
      <meta property="og:description" content={seo?.ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={seo?.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={seo?.twitterTitle || title} />
      <meta name="twitter:description" content={seo?.twitterDesc || description} />
      <meta name="twitter:image" content={seo?.twitterImage || ogImage} />
    </Helmet>
  );
}
```

**Install react-helmet-async:**

```bash
npm install react-helmet-async
```

**Use in your pages:**

```tsx
import { SEOHead } from '@/components/SEOHead';

export default function AboutPage() {
  return (
    <>
      <SEOHead 
        path="/about" 
        defaultTitle="About Us"
        defaultDescription="Learn more about our company"
      />
      <div>
        {/* Your page content */}
      </div>
    </>
  );
}
```

---

## ⚙️ Step 5: Environment Variables

Add to your `.env` file:

```env
# Development
VITE_CMS_API_URL=http://localhost:3001/api/v1

# Production
# VITE_CMS_API_URL=https://your-cms-api.com/api/v1
```

---

## 🎯 Complete Example: Full Page Integration

```tsx
import { useCMSContent } from '@/hooks/useCMSContent';
import { SEOHead } from '@/components/SEOHead';

export default function HomePage() {
  const { getContent, loading, error } = useCMSContent({ 
    path: '/',
    // Optional: specify project ID if you have multiple projects
    // projectId: 'your-project-id'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('CMS Error:', error);
    // Fallback to static content
  }

  return (
    <>
      <SEOHead path="/" />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {getContent('hero_heading', 'Welcome to Our Site')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {getContent('hero_description', 'Default description here')}
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg">
              {getContent('hero_cta_text', 'Get Started')}
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {getContent('features_heading', 'Our Features')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-3">
                    {getContent(`feature_${i}_title`, `Feature ${i}`)}
                  </h3>
                  <p className="text-gray-600">
                    {getContent(`feature_${i}_description`, 'Feature description')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
```

---

## 🔄 How Content Keys Work

When you crawl your site, the CMS automatically creates content blocks with keys like:

- `hero_heading` - Main heading text
- `hero_description` - Description text
- `nav_link_1` - Navigation links
- `feature_1_title` - Feature titles
- `cta_button_text` - Button text

You can see all available keys in the **Content Editor** dashboard.

---

## 🎨 Advanced: Bulk Content Loading

If you want to load all content at once:

```tsx
const { getContentObject } = useCMSContent({ path: '/' });
const content = getContentObject();

// Now use like:
<h1>{content.hero_heading}</h1>
<p>{content.hero_description}</p>
```

---

## 🚀 Production Deployment

1. **Build your site:**
   ```bash
   npm run build
   ```

2. **Set production API URL:**
   ```env
   VITE_CMS_API_URL=https://your-cms-api.com/api/v1
   ```

3. **Deploy both:**
   - Deploy your CMS backend
   - Deploy your frontend site
   - Make sure CORS is configured on backend

---

## ✅ Testing

1. Start your CMS backend: `npm run dev` (in backend folder)
2. Start your live site: `npm run dev`
3. Crawl your site from CMS dashboard
4. Edit content in CMS
5. Refresh your live site - content should update!

---

## 🎯 Key Points

- ✅ Content updates in real-time (no rebuild needed)
- ✅ SEO meta tags automatically applied
- ✅ Fallback to default content if CMS fails
- ✅ Works with both local and production sites
- ✅ No page reload needed for content changes

---

## 🆘 Troubleshooting

**Content not loading?**
- Check API URL in `.env`
- Verify backend is running
- Check browser console for errors
- Ensure page path matches crawled path

**SEO not working?**
- Install `react-helmet-async`
- Wrap app in `<HelmetProvider>`
- Check SEO data in CMS dashboard

---

## 📚 Next Steps

1. Crawl your site
2. Copy the hook to your project
3. Update one component to test
4. Add SEO component
5. Deploy and enjoy! 🎉
