# 🎯 Simple CMS Integration Example

## Scenario: Aapki Pricing Page

### Before CMS (Hard-coded):

```typescript
// src/pages/Pricing.tsx
function Pricing() {
  return (
    <div>
      <h1>Our Pricing Plans</h1>
      <p>Choose the perfect plan for your needs</p>
      
      <div className="plan">
        <h2>Basic Plan</h2>
        <p className="price">$29/month</p>
        <p>Perfect for small projects</p>
      </div>
      
      <div className="plan">
        <h2>Pro Plan</h2>
        <p className="price">$99/month</p>
        <p>For growing businesses</p>
      </div>
    </div>
  );
}
```

**Problem:** Har baar price change karne ke liye code edit karna padta hai!

---

### After CMS (Dynamic):

```typescript
// src/pages/Pricing.tsx
import { useCMS } from '@/contexts/CMSContext';

function Pricing() {
  const { getContent } = useCMS();
  
  return (
    <div>
      <h1>{getContent('pricing.title', 'Our Pricing Plans')}</h1>
      <p>{getContent('pricing.subtitle', 'Choose the perfect plan')}</p>
      
      <div className="plan">
        <h2>{getContent('pricing.basic.title', 'Basic Plan')}</h2>
        <p className="price">{getContent('pricing.basic.price', '$29/month')}</p>
        <p>{getContent('pricing.basic.description', 'Perfect for small projects')}</p>
      </div>
      
      <div className="plan">
        <h2>{getContent('pricing.pro.title', 'Pro Plan')}</h2>
        <p className="price">{getContent('pricing.pro.price', '$99/month')}</p>
        <p>{getContent('pricing.pro.description', 'For growing businesses')}</p>
      </div>
    </div>
  );
}
```

**Benefit:** Ab dashboard se content edit kar sakte hain, code touch nahi karna!

---

## 📊 Step-by-Step Process

### Step 1: Crawl Your Site
```
1. Open: http://localhost:5173/dashboard/crawler
2. Enter URL: http://localhost:3000
3. Click: "Start Crawl"
4. Wait for completion
```

### Step 2: Check Crawled Pages
```
1. Open: http://localhost:5173/dashboard/pages
2. You'll see: /pricing page in the list
3. Click: Edit button (pencil icon)
```

### Step 3: View Content Blocks
```
Dashboard will show all detected content blocks:

Key                          | Value
---------------------------- | ---------------------------
pricing.title                | Our Pricing Plans
pricing.subtitle             | Choose the perfect plan
pricing.basic.title          | Basic Plan
pricing.basic.price          | $29/month
pricing.basic.description    | Perfect for small projects
pricing.pro.title            | Pro Plan
pricing.pro.price            | $99/month
pricing.pro.description      | For growing businesses
```

### Step 4: Edit Content
```
1. Click on any content block
2. Change the value (e.g., $29/month → $39/month)
3. Click Save
```

### Step 5: See Changes Live
```
1. Go to: http://localhost:3000/pricing
2. Refresh page
3. New price shows automatically! 🎉
```

---

## 🎨 Real Example from Your Site

### Your Current Pricing Page HTML:
```html
<div class="pricing-page">
  <h1>Pricing | MEP Estimating Services USA</h1>
  <p>Get accurate estimates for your projects</p>
  
  <div class="pricing-card">
    <h2>Residential Projects</h2>
    <p class="price">Starting at $500</p>
  </div>
</div>
```

### After Crawling, You Get These Keys:
```
pricing-page.h1              → "Pricing | MEP Estimating Services USA"
pricing-page.p               → "Get accurate estimates for your projects"
pricing-card.h2              → "Residential Projects"
pricing-card.price           → "Starting at $500"
```

### Update Your React Component:
```typescript
import { useCMS } from '@/contexts/CMSContext';

function PricingPage() {
  const { getContent } = useCMS();
  
  return (
    <div className="pricing-page">
      <h1>{getContent('pricing-page.h1', 'Pricing | MEP Estimating Services USA')}</h1>
      <p>{getContent('pricing-page.p', 'Get accurate estimates')}</p>
      
      <div className="pricing-card">
        <h2>{getContent('pricing-card.h2', 'Residential Projects')}</h2>
        <p className="price">{getContent('pricing-card.price', 'Starting at $500')}</p>
      </div>
    </div>
  );
}
```

### Now Edit from Dashboard:
```
1. Dashboard → Pages → /pricing → Edit
2. Change "Starting at $500" to "Starting at $750"
3. Save
4. Your website automatically shows $750! 🚀
```

---

## 🔥 Pro Tips

### Tip 1: Use Meaningful Keys
```typescript
// ❌ Bad
getContent('h1', 'Title')
getContent('p1', 'Description')

// ✅ Good
getContent('hero.title', 'Welcome')
getContent('hero.description', 'Learn more')
```

### Tip 2: Always Provide Defaults
```typescript
// ❌ Bad - Shows empty if CMS fails
getContent('pricing.title')

// ✅ Good - Shows fallback
getContent('pricing.title', 'Our Pricing Plans')
```

### Tip 3: Use CMSContent for Simple Cases
```typescript
// Instead of this:
const { getContent } = useCMS();
<h1>{getContent('title', 'Default')}</h1>

// Use this:
<h1>
  <CMSContent contentKey="title" defaultValue="Default" />
</h1>
```

### Tip 4: Test in Browser Console
```javascript
// Check what content is available
window.cms.getAll()

// Test a specific key
window.cms.get('pricing.title')

// Check SEO data
window.cms.seo
```

---

## 🎯 Summary

**Before CMS:**
- ❌ Code changes for content updates
- ❌ Developer needed for every change
- ❌ Deploy required for updates
- ❌ Slow iteration

**After CMS:**
- ✅ Dashboard-based content editing
- ✅ Non-technical users can edit
- ✅ Instant updates (no deploy)
- ✅ Fast iteration

**Your Workflow:**
```
1. Crawl site once
2. Integrate CMS in React components
3. Edit content from dashboard
4. Changes reflect immediately
5. No code changes needed! 🎉
```
