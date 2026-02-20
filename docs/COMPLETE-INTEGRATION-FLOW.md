# 🚀 Complete Integration Flow - Local to Live

Complete step-by-step guide to integrate CMS into any website (local testing → live deployment)

---

## 📋 Overview

```
CMS Dashboard → Crawl Website → Edit Content → Integrate Code → Test Local → Deploy Live
```

---

## 🎯 Phase 1: Setup CMS (One Time)

### Step 1: Start CMS Backend

```bash
cd backend
npm install
npm run dev
```

✅ Backend running on: `http://localhost:3001`

### Step 2: Start CMS Dashboard

```bash
cd ..  # root folder
npm install
npm run dev
```

✅ Dashboard running on: `http://localhost:8080`

---

## 🎯 Phase 2: Crawl Your Website

### Step 1: Open CMS Dashboard

Go to: `http://localhost:8080/dashboard/crawler`

### Step 2: Enter Your Website URL

**For Local Testing:**
```
http://localhost:3000
```

**For Live Site:**
```
https://yourwebsite.com
```

### Step 3: Start Crawl

1. Enter project name: "My Website"
2. Click "Start Crawl"
3. Wait for completion
4. ✅ Pages discovered and saved!

### Step 4: Verify Pages

Go to: `http://localhost:8080/dashboard/pages`

You should see all your pages listed.

---

## 🎯 Phase 3: Edit Content & SEO

### Step 1: Edit Content

1. Go to: `http://localhost:8080/dashboard/pages`
2. Click on any page
3. Click "Edit" button
4. Modify content blocks
5. Click "Save Changes"

### Step 2: Edit SEO

1. Go to: `http://localhost:8080/dashboard/seo`
2. Select a page
3. Fill in:
   - Meta Title
   - Meta Description
   - Keywords
   - OG Image
   - Twitter Card
4. Click "Save Changes"

✅ Content & SEO ready!

---

## 🎯 Phase 4: Integrate Into Your Website

### Step 1: Copy Required Files

Copy these 2 files to your website project:

#### File 1: `src/hooks/useCMSContent.ts`

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

#### File 2: `src/contexts/CMSContext.tsx`

```typescript
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useCMSContent } from '../hooks/useCMSContent';
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
    }
  }, [cms]);

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
```

### Step 2: Update App.tsx

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CMSProvider } from './contexts/CMSContext';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <CMSProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </CMSProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 3: Create .env File

```env
# Local Development
VITE_CMS_API_URL=http://localhost:3001/api/v1

# Production (uncomment when deploying)
# VITE_CMS_API_URL=https://your-cms-api.com/api/v1
```

### Step 4: Update Your Pages

**Before:**
```tsx
// pages/Home.tsx
export default function Home() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      <p>This is static content</p>
    </div>
  );
}
```

**After:**
```tsx
// pages/Home.tsx
export default function Home() {
  return (
    <div>
      <h1>{window.cms.get('hero_heading', 'Welcome to My Website')}</h1>
      <p>{window.cms.get('hero_description', 'This is static content')}</p>
    </div>
  );
}
```

---

## 🎯 Phase 5: Test Locally

### Step 1: Start Your Website

```bash
npm run dev
```

Your website: `http://localhost:3000`

### Step 2: Verify Content Loading

1. Open browser console (F12)
2. Type: `window.cms.get('hero_heading')`
3. Should return content from CMS!

### Step 3: Test Content Updates

1. Go to CMS Dashboard
2. Edit content
3. Save changes
4. Refresh your website
5. ✅ Content should update!

### Step 4: Test SEO

1. View page source (Ctrl+U)
2. Check `<title>` tag
3. Check `<meta name="description">`
4. Check Open Graph tags
5. ✅ All should be from CMS!

---

## 🎯 Phase 6: Deploy to Production

### Step 1: Deploy CMS Backend

**Option A: Railway/Render/Heroku**

```bash
cd backend
git init
git add .
git commit -m "CMS Backend"
# Push to Railway/Render/Heroku
```

Get your backend URL: `https://your-cms-api.com`

**Option B: VPS/DigitalOcean**

```bash
# SSH to server
cd /var/www/cms-backend
npm install
npm run build
pm2 start dist/main.js --name cms-backend
```

### Step 2: Update Environment Variables

**Production .env:**
```env
VITE_CMS_API_URL=https://your-cms-api.com/api/v1
```

### Step 3: Build Your Website

```bash
npm run build
```

### Step 4: Deploy Your Website

**Option A: Vercel/Netlify**
```bash
# Connect GitHub repo
# Set environment variable: VITE_CMS_API_URL
# Deploy!
```

**Option B: VPS**
```bash
# Upload build folder
# Configure nginx
# Done!
```

### Step 5: Update CMS Dashboard

1. Go to: `http://localhost:8080/dashboard/settings`
2. Update project URL to: `https://yourwebsite.com`
3. Save changes

### Step 6: Re-crawl Live Site

1. Go to: `http://localhost:8080/dashboard/crawler`
2. Enter: `https://yourwebsite.com`
3. Select your project
4. Start crawl
5. ✅ Live site crawled!

---

## 🎯 Phase 7: Manage Content (Production)

### Daily Workflow:

1. **Edit Content:**
   - Open CMS Dashboard
   - Go to Pages/SEO
   - Edit content
   - Save

2. **Content Updates:**
   - Changes reflect immediately
   - No rebuild needed
   - No deployment needed

3. **Preview Changes:**
   - Use "Show Preview" in Content Editor
   - See live site in iframe
   - Edit and save

---

## ✅ Checklist

### Local Testing:
- [ ] CMS Backend running
- [ ] CMS Dashboard running
- [ ] Website crawled
- [ ] Content edited
- [ ] Files copied to website
- [ ] App.tsx updated
- [ ] .env file created
- [ ] Website running
- [ ] Content loading from CMS
- [ ] SEO tags working

### Production:
- [ ] CMS Backend deployed
- [ ] Backend URL obtained
- [ ] .env updated with production URL
- [ ] Website built
- [ ] Website deployed
- [ ] Project URL updated in CMS
- [ ] Live site crawled
- [ ] Content editable from CMS
- [ ] Changes reflecting on live site

---

## 🆘 Troubleshooting

### Content Not Loading?

**Check 1: API URL**
```bash
# In browser console
console.log(import.meta.env.VITE_CMS_API_URL)
```

**Check 2: Backend Running**
```bash
curl http://localhost:3001/api/v1/pages/by-path?path=/
```

**Check 3: CORS**
Backend should allow your domain in CORS settings.

**Check 4: Network Tab**
Open DevTools → Network → Check API calls

### SEO Not Working?

**Check 1: window.cms.seo**
```javascript
console.log(window.cms.seo)
```

**Check 2: Page Crawled**
Verify page exists in CMS Dashboard → Pages

**Check 3: SEO Data Saved**
Check CMS Dashboard → SEO → Verify data

---

## 🎯 Quick Commands Reference

```bash
# Start CMS Backend
cd backend && npm run dev

# Start CMS Dashboard
npm run dev

# Start Your Website
cd your-website && npm run dev

# Build for Production
npm run build

# Check API
curl http://localhost:3001/api/v1/pages/by-path?path=/
```

---

## 📚 Summary

1. ✅ **Setup CMS** - One time
2. ✅ **Crawl Website** - Get all pages
3. ✅ **Edit Content** - Dashboard
4. ✅ **Copy 2 Files** - Hook + Context
5. ✅ **Update App.tsx** - Wrap with CMSProvider
6. ✅ **Add .env** - API URL
7. ✅ **Use in Pages** - `window.cms.get()`
8. ✅ **Test Local** - Verify everything works
9. ✅ **Deploy** - Backend + Frontend
10. ✅ **Manage** - Edit anytime from dashboard

---

## 🎉 Done!

Your website is now powered by CMS!

- ✅ Edit content from dashboard
- ✅ Update SEO anytime
- ✅ No code changes needed
- ✅ No rebuilds required
- ✅ Changes reflect instantly

**Happy Content Managing! 🚀**
