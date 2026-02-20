# 🎯 Professional CMS Integration Guide

## Complete Setup for Any Website

This guide will help you integrate the CMS into your existing React website professionally.

---

## 📋 Prerequisites

- React 18+ with React Router v6
- TypeScript (recommended)
- Tailwind CSS (for styling)
- Backend running on `http://localhost:3001`

---

## 🚀 Step-by-Step Integration

### Step 1: Copy Required Files

Copy these files from the CMS project to your website:

```bash
# From CMS project root
YOUR_WEBSITE="../your-website"  # Adjust path

# Copy hooks
cp src/hooks/useCMSContent.ts $YOUR_WEBSITE/src/hooks/

# Copy contexts
cp src/contexts/CMSContext.tsx $YOUR_WEBSITE/src/contexts/

# Copy components
cp src/components/DynamicPage.tsx $YOUR_WEBSITE/src/components/
```

---

### Step 2: Environment Configuration

Create or update `.env` in your website root:

```env
# CMS API Configuration
VITE_API_URL=http://localhost:3001/api/v1

# Production
# VITE_API_URL=https://your-api.com/api/v1
```

---

### Step 3: Update Your Router

Update your main routing file (usually `App.tsx` or `main.tsx`):

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CMSProvider } from './contexts/CMSContext';
import { DynamicPage } from './components/DynamicPage';

// Your existing components
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';

function App() {
  return (
    <BrowserRouter>
      <CMSProvider>
        <Routes>
          {/* Static Routes - Define these first */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Dynamic Route - MUST be last */}
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </CMSProvider>
    </BrowserRouter>
  );
}

export default App;
```

**Critical:** The `path="*"` route MUST be last to avoid overriding static routes.

---

### Step 4: Install Required Dependencies

If not already installed:

```bash
npm install lucide-react
# or
yarn add lucide-react
```

---

### Step 5: Verify Installation

Start your development server:

```bash
npm run dev
```

Check console for:
```
✅ CMS loaded for: /
🔑 Available keys: [...]
🎨 Auto content replacement complete!
```

---

## 🎨 Customization

### Custom Styling

The DynamicPage component uses Tailwind CSS. Customize by editing:

```typescript
// src/components/DynamicPage.tsx

// Change container width
<div className="container mx-auto px-4 py-12 max-w-7xl">
// to
<div className="container mx-auto px-4 py-12 max-w-4xl">

// Change heading styles
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
// to
<h1 className="text-3xl md:text-4xl font-semibold text-blue-900 mb-6">
```

### Custom 404 Page

Replace the 404 section in `DynamicPage.tsx`:

```typescript
if (error || !data) {
  return <Custom404Page path={location.pathname} />;
}
```

### Custom Loading State

```typescript
if (loading) {
  return <CustomLoadingSpinner />;
}
```

---

## 📝 Usage Examples

### Example 1: Location Pages

#### Create Page via API:

```bash
POST http://localhost:3001/api/v1/pages
Content-Type: application/json

{
  "projectId": "your-project-id",
  "path": "/locations/phoenix",
  "title": "Phoenix Location | Your Company"
}
```

#### Add Content in Dashboard:

```
Dashboard → Pages → /locations/phoenix → Edit

Add content blocks:
- h1_1: "Visit Our Phoenix Office"
- h2_1: "Location Details"
- p_1: "123 Main Street, Phoenix, AZ 85001"
- p_2: "Open Monday-Friday, 9AM-5PM"
- button_1: "Get Directions"
```

#### Visit:

```
http://localhost:3000/locations/phoenix
```

---

### Example 2: Service Pages

```bash
POST http://localhost:3001/api/v1/pages

{
  "projectId": "your-project-id",
  "path": "/services/residential",
  "title": "Residential Services"
}
```

---

### Example 3: Blog Posts

```bash
POST http://localhost:3001/api/v1/pages

{
  "projectId": "your-project-id",
  "path": "/blog/how-to-estimate-costs",
  "title": "How to Estimate Construction Costs"
}
```

---

## 🔍 SEO Configuration

SEO is automatically handled! Just configure in dashboard:

```
Dashboard → Pages → Select Page → SEO Tab

Fields:
- Title: "Phoenix Location | Your Company"
- Description: "Visit our Phoenix office for..."
- Keywords: "Phoenix, location, office"
- OG Image: "https://yoursite.com/images/phoenix.jpg"
- Canonical: "https://yoursite.com/locations/phoenix"
- Robots: "index, follow"
```

Meta tags are automatically injected into `<head>`.

---

## 🎯 Content Management

### Auto-Replace Feature

Content is automatically replaced based on element order:

```html
<!-- Your HTML -->
<h1>Original Title</h1>
<p>Original paragraph</p>

<!-- After CMS loads -->
<h1>Title from CMS (h1_1)</h1>
<p>Paragraph from CMS (p_1)</p>
```

### Skip Auto-Replace

To prevent auto-replace on specific elements:

```html
<h1 data-cms-skip>This won't be replaced</h1>
<img data-cms-skip src="logo.png" alt="Logo" />
```

### Custom Keys

Use custom keys for specific content:

```html
<h1 data-cms="hero.title">Default Title</h1>
<p data-cms="hero.description">Default Description</p>
```

Then in dashboard, create blocks with keys:
- `hero.title`
- `hero.description`

---

## 🐛 Troubleshooting

### Issue: CMS not loading

**Check:**
1. Backend is running: `http://localhost:3001`
2. `.env` file exists with correct `VITE_API_URL`
3. CMSProvider wraps your routes
4. Console shows CMS logs

**Solution:**
```bash
# Restart dev server
npm run dev

# Check console
window.cms.getAll()
```

---

### Issue: Dynamic pages show 404

**Check:**
1. Page exists in database
2. Path matches exactly (including leading slash)
3. `path="*"` route is last in Routes

**Solution:**
```typescript
// Verify route order
<Route path="/about" element={<About />} />  // Static first
<Route path="*" element={<DynamicPage />} /> // Dynamic last
```

---

### Issue: Content not updating

**Check:**
1. Content blocks added in dashboard
2. Page saved
3. Browser cache cleared

**Solution:**
```bash
# Hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

### Issue: Styling looks broken

**Check:**
1. Tailwind CSS is installed and configured
2. Tailwind classes are not being purged

**Solution:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ...
}
```

---

## 📊 Performance Optimization

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const DynamicPage = lazy(() => import('./components/DynamicPage'));

<Route 
  path="*" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <DynamicPage />
    </Suspense>
  } 
/>
```

### Caching

CMS data is fetched on route change. To add caching:

```typescript
// In useCMSContent.ts
// Add React Query or SWR for caching
```

---

## 🚀 Production Deployment

### Environment Variables

```env
# Production .env
VITE_API_URL=https://your-production-api.com/api/v1
```

### Build

```bash
npm run build
```

### Deploy

Deploy `dist/` folder to your hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

---

## ✅ Checklist

Before going live:

- [ ] All files copied correctly
- [ ] `.env` configured
- [ ] CMSProvider wraps routes
- [ ] Dynamic route is last
- [ ] Backend is accessible
- [ ] Pages created in dashboard
- [ ] Content added and saved
- [ ] SEO configured
- [ ] Tested on localhost
- [ ] Production env vars set
- [ ] Build successful
- [ ] Deployed and tested

---

## 🎉 You're Done!

Your website now has:
- ✅ Dynamic page creation
- ✅ Content management
- ✅ SEO optimization
- ✅ Professional design
- ✅ No code changes needed for new pages

Create unlimited pages from the dashboard! 🚀
