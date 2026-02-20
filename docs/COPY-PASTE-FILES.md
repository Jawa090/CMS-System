# 📋 Copy-Paste Ready Files

## Yeh files apni actual website mein copy karein

---

## File 1: `.env` (Root folder mein)

**Location:** `/your-website/.env`

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## File 2: `src/hooks/useCMSContent.ts`

**Location:** `/your-website/src/hooks/useCMSContent.ts`

Agar `hooks` folder nahi hai to pehle create karein:
```bash
mkdir src/hooks
```

Then create this file with this content (already in your current project, copy from there!)

---

## File 3: `src/contexts/CMSContext.tsx`

**Location:** `/your-website/src/contexts/CMSContext.tsx`

Agar `contexts` folder nahi hai to pehle create karein:
```bash
mkdir src/contexts
```

Then create this file with this content (already in your current project, copy from there!)

---

## File 4: Update `src/App.tsx` or `src/main.tsx`

**Find your main app file and wrap with CMSProvider:**

### If using App.tsx:

```typescript
import { BrowserRouter } from 'react-router-dom';
import { CMSProvider } from './contexts/CMSContext';

function App() {
  return (
    <BrowserRouter>
      <CMSProvider>
        {/* Your existing routes and components */}
      </CMSProvider>
    </BrowserRouter>
  );
}

export default App;
```

### If using main.tsx:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CMSProvider } from './contexts/CMSContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CMSProvider>
        <App />
      </CMSProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 🎯 Quick Copy Commands

### From this CMS dashboard project to your actual website:

```bash
# Assuming your website is at ../your-website/

# Copy hook
cp src/hooks/useCMSContent.ts ../your-website/src/hooks/

# Copy context
cp src/contexts/CMSContext.tsx ../your-website/src/contexts/

# Copy env
echo "VITE_API_URL=http://localhost:3001/api/v1" > ../your-website/.env
```

---

## ✅ Verification Checklist

After copying files, check:

- [ ] `.env` file exists in root with `VITE_API_URL`
- [ ] `src/hooks/useCMSContent.ts` exists
- [ ] `src/contexts/CMSContext.tsx` exists
- [ ] App is wrapped with `<CMSProvider>`
- [ ] Backend is running on port 3001
- [ ] Frontend can access `http://localhost:3001/api/v1`

---

## 🧪 Test Integration

### 1. Start Backend:
```bash
cd backend
npm run start:dev
```

### 2. Start Your Website:
```bash
cd your-website
npm run dev
```

### 3. Open Browser Console:
```javascript
// Should return CMS object
window.cms

// Should return empty object (before crawling)
window.cms.getAll()
```

### 4. Crawl Your Site:
```
1. Open: http://localhost:5173/dashboard/crawler
2. Enter: http://localhost:3000 (your website URL)
3. Click: Start Crawl
4. Wait for completion
```

### 5. Check Content:
```javascript
// Should now return content
window.cms.getAll()

// Should return specific content
window.cms.get('pricing.title')
```

---

## 🎨 Example Component

Create a test component to verify:

```typescript
// src/pages/TestCMS.tsx
import { useCMS } from '@/contexts/CMSContext';

export function TestCMS() {
  const { getContent, getContentObject, loading, error } = useCMS();
  
  if (loading) return <div>Loading CMS...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>CMS Integration Test</h1>
      
      <h2>Test Content:</h2>
      <p>{getContent('test.title', 'Default Title')}</p>
      
      <h2>All Content:</h2>
      <pre>{JSON.stringify(getContentObject(), null, 2)}</pre>
      
      <h2>Window CMS:</h2>
      <button onClick={() => console.log(window.cms.getAll())}>
        Log All Content
      </button>
    </div>
  );
}
```

Add route:
```typescript
<Route path="/test-cms" element={<TestCMS />} />
```

Visit: `http://localhost:3000/test-cms`

---

## 🚀 You're Ready!

Ab aap:
1. ✅ CMS integrated hai
2. ✅ Dashboard se content edit kar sakte hain
3. ✅ Changes automatically reflect honge
4. ✅ No code changes needed for content updates!

Happy coding! 🎉
