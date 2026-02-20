# 🎯 Automatic Content Replacement Guide

## ✨ No More Manual Integration!

Ab aapko har component mein `getContent()` add karne ki zaroorat nahi hai. Content **automatically** replace ho jayega!

---

## 🚀 How It Works

### Before (Manual - Tough):
```typescript
// ❌ Har component mein yeh karna padta tha
import { useCMS } from '@/contexts/CMSContext';

function About() {
  const { getContent } = useCMS();
  
  return (
    <div>
      <h1>{getContent('h1_1', 'About Us')}</h1>
      <p>{getContent('p_1', 'Description')}</p>
      <p>{getContent('p_2', 'More text')}</p>
    </div>
  );
}
```

### After (Automatic - Easy):
```typescript
// ✅ Kuch nahi karna, automatically replace ho jayega!
function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Description</p>
      <p>More text</p>
    </div>
  );
}
```

---

## 🎨 How Content Keys Are Mapped

### Automatic Mapping:
```
First h1 on page  → h1_1
Second h1 on page → h1_2
First p on page   → p_1
Second p on page  → p_2
First button      → button_1
```

### Example:
```html
<div>
  <h1>Original Title</h1>        <!-- Will be replaced by h1_1 -->
  <h2>Subtitle</h2>              <!-- Will be replaced by h2_1 -->
  <p>First paragraph</p>         <!-- Will be replaced by p_1 -->
  <p>Second paragraph</p>        <!-- Will be replaced by p_2 -->
  <button>Click Me</button>      <!-- Will be replaced by button_1 -->
</div>
```

After crawling and editing in dashboard, these will automatically update!

---

## 🛠️ Advanced Usage

### Option 1: Skip Specific Elements

Agar koi element CMS se replace nahi karna:

```html
<h1 data-cms-skip>This will NOT be replaced</h1>
<p>This WILL be replaced</p>
```

### Option 2: Custom Keys

Agar specific key use karna hai:

```html
<h1 data-cms="hero.title">Default Title</h1>
<p data-cms="hero.description">Default Description</p>
```

Then in dashboard, create content blocks with keys:
- `hero.title`
- `hero.description`

---

## 📋 Complete Workflow

### Step 1: Setup (One Time Only)

1. Copy `CMSContext.tsx` to your project
2. Copy `useCMSContent.ts` to your project
3. Add `.env` with `VITE_API_URL=http://localhost:3001/api/v1`
4. Wrap app with `<CMSProvider>`

### Step 2: Crawl Your Site

```
1. Open: http://localhost:5173/dashboard/crawler
2. Enter: http://localhost:3000 (your site URL)
3. Click: Start Crawl
4. Wait for completion
```

### Step 3: Edit Content

```
1. Open: http://localhost:5173/dashboard/pages
2. Select: Your page (e.g., /about)
3. Click: Edit button
4. Modify: Content blocks
5. Click: Save
```

### Step 4: See Changes

```
1. Go to: http://localhost:3000/about
2. Refresh: Ctrl + Shift + R
3. Done! Content automatically updated! 🎉
```

---

## 🎯 Real Example

### Your About Page:

```typescript
// src/pages/About.tsx
export function About() {
  return (
    <div className="about-page">
      <h1>ABOUT PHOENIX CONSTRUCTION ESTIMATING</h1>
      <h2>Who We Are</h2>
      <p>We are a leading construction estimating company...</p>
      <p>Our team has over 20 years of experience...</p>
      
      <h2>Our Services</h2>
      <p>We provide accurate cost estimates...</p>
      
      <button>Contact Us</button>
    </div>
  );
}
```

### After Crawling:

Dashboard will show:
```
h1_1  → "ABOUT PHOENIX CONSTRUCTION ESTIMATING"
h2_1  → "Who We Are"
p_1   → "We are a leading construction estimating company..."
p_2   → "Our team has over 20 years of experience..."
h2_2  → "Our Services"
p_3   → "We provide accurate cost estimates..."
button_1 → "Contact Us"
```

### Edit in Dashboard:

Change `h1_1` to:
```
"ABOUT PHOENIX CONSTRUCTION ESTIMATING SERVICES"
```

### Result:

Your website automatically shows:
```html
<h1>ABOUT PHOENIX CONSTRUCTION ESTIMATING SERVICES</h1>
```

**No code changes needed!** 🚀

---

## 🔍 Debugging

### Check if CMS is working:

```javascript
// In browser console
window.cms.getAll()
```

Should return:
```javascript
{
  h1_1: "ABOUT PHOENIX CONSTRUCTION ESTIMATING SERVICES",
  h2_1: "Who We Are",
  p_1: "We are a leading...",
  // ... etc
}
```

### Check specific content:

```javascript
window.cms.get('h1_1')
// Returns: "ABOUT PHOENIX CONSTRUCTION ESTIMATING SERVICES"
```

### Force refresh:

```javascript
// Reload page with cache clear
location.reload(true)
```

---

## ⚠️ Important Notes

### 1. Element Order Matters

Content keys are based on element order in DOM:
```html
<h1>First</h1>   <!-- h1_1 -->
<h1>Second</h1>  <!-- h1_2 -->
```

If you change order, keys will change!

### 2. Dynamic Content

For dynamic content (loops, conditionals), use manual approach:
```typescript
const { getContent } = useCMS();

{items.map((item, i) => (
  <p key={i}>{getContent(`item_${i}`, item.text)}</p>
))}
```

### 3. Navigation Links

Links (`<a>` tags) are also replaced. If you don't want this:
```html
<a href="/about" data-cms-skip>About</a>
```

### 4. Refresh After Edit

After editing in dashboard, refresh your site:
- Hard refresh: `Ctrl + Shift + R`
- Or clear cache

---

## 🎉 Benefits

✅ **Zero Code Changes** - Edit content without touching code
✅ **Automatic Updates** - Changes reflect immediately
✅ **No Manual Integration** - Works out of the box
✅ **Fallback Support** - Shows original text if CMS fails
✅ **SEO Friendly** - Content is in HTML, not loaded via JS
✅ **Type Safe** - Full TypeScript support

---

## 🐛 Troubleshooting

### Issue: Content not updating

**Solution 1:** Hard refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**Solution 2:** Check console
```javascript
window.cms.getAll()
// Should show your content
```

**Solution 3:** Check if page is crawled
```
Dashboard → Pages → Check if page exists
```

### Issue: Wrong content showing

**Reason:** Element order changed

**Solution:** Re-crawl the page
```
Dashboard → Crawler → Re-crawl site
```

### Issue: Some elements not replacing

**Reason:** Element might have `data-cms-skip`

**Solution:** Remove the attribute or use custom key:
```html
<h1 data-cms="custom.key">Text</h1>
```

---

## 📝 Summary

**Setup Once:**
1. Add CMS files to project
2. Wrap app with CMSProvider
3. Crawl your site

**Use Forever:**
1. Edit content in dashboard
2. Refresh website
3. Done! 🎉

**No more:**
- ❌ Manual `getContent()` calls
- ❌ Code changes for content
- ❌ Deployments for text updates
- ❌ Developer needed for edits

**Just:**
- ✅ Edit in dashboard
- ✅ Refresh browser
- ✅ Content updated!

---

## 🚀 You're Ready!

Ab aap:
1. ✅ Automatic content replacement use kar sakte hain
2. ✅ Dashboard se content edit kar sakte hain
3. ✅ Koi code change nahi karna
4. ✅ Instant updates!

Happy editing! 🎉
