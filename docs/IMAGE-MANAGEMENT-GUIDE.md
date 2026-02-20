# 🖼️ Image Management Guide

## Overview

Har page pe automatically images add ho jayein! Marketing team dashboard se images change kar sakti hai.

---

## 🎨 How Images Work

### Automatic Image Generation
Jab aap template se page create karte ho, **images automatically add ho jayein** with placeholder URLs!

---

## 📋 Images Per Template

### 1. 📍 Location Page (5 Images)

**Auto-generated images:**
1. **Hero Background** - Large banner image
2. **About Section** - Team/office image
3. **Residential Service** - Home construction image
4. **Commercial Service** - Office building image
5. **Industrial Service** - Warehouse/factory image

**Total Blocks**: 29 (24 text + 5 images)

---

### 2. 🔧 Service Page (2 Images)

**Auto-generated images:**
1. **Hero Image** - Service banner
2. **Features Image** - Service features visual

**Total Blocks**: 11 (9 text + 2 images)

---

### 3. 📄 Basic Page (1 Image)

**Auto-generated images:**
1. **Header Image** - Page header banner

**Total Blocks**: 5 (4 text + 1 image)

---

## ✏️ How to Change Images

### Method 1: Dashboard Editor (Recommended)

1. **Go to Dashboard**
   ```
   http://localhost:5173/dashboard/pages
   ```

2. **Select Your Page**
   - Click on the page you want to edit

3. **Find Image Block**
   - Scroll to image blocks (e.g., "Hero Background Image")

4. **Change Image URL**
   - Edit the URL field
   - Paste new image URL
   - Click "Save Changes"

5. **Publish**
   - Click "Publish" to make live

---

### Method 2: Upload Custom Image (Future Feature)

Coming soon! Upload images directly from dashboard.

---

## 🌐 Image Sources

### Free Stock Images:

**Unsplash** (Already used in templates)
- Construction: `https://unsplash.com/s/photos/construction`
- Buildings: `https://unsplash.com/s/photos/building`
- Architecture: `https://unsplash.com/s/photos/architecture`

**Pexels**
- Free commercial use
- High quality images
- `https://www.pexels.com/`

**Pixabay**
- Free images
- No attribution required
- `https://pixabay.com/`

---

## 📐 Recommended Image Sizes

### Hero Images
- **Size**: 1920x1080px (Full HD)
- **Format**: JPG or WebP
- **Max File Size**: 500KB

### Section Images
- **Size**: 800x600px
- **Format**: JPG or WebP
- **Max File Size**: 200KB

### Service Icons/Images
- **Size**: 600x400px
- **Format**: JPG, PNG, or WebP
- **Max File Size**: 150KB

---

## 🎯 Default Images (Placeholders)

All templates use **Unsplash** placeholder images:

### Location Template:
```
Hero: https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200
About: https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800
Residential: https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600
Commercial: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600
Industrial: https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600
```

### Service Template:
```
Hero: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200
Features: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800
```

### Basic Template:
```
Header: https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200
```

---

## 💡 Pro Tips

### Tip 1: Use Consistent Style
- Same color palette across all images
- Similar photography style
- Consistent lighting

### Tip 2: Optimize Images
- Compress before uploading
- Use WebP format for better performance
- Lazy load images

### Tip 3: Alt Text
- Each image has alt text in metadata
- Edit alt text for SEO
- Describe image content clearly

### Tip 4: Responsive Images
- Images automatically responsive
- Works on mobile, tablet, desktop
- No extra code needed

---

## 🔄 Workflow

### Creating New Page with Images:

```
1. Dashboard → Create New Page
   ↓
2. Select Template (Location/Service/Basic)
   ↓
3. Enter Path & Title
   ↓
4. Click "Create"
   ↓
5. ✨ Images automatically added!
   ↓
6. Edit → Change image URLs
   ↓
7. Save & Publish
```

---

## 📊 Image Block Structure

Each image block contains:

```json
{
  "type": "IMAGE",
  "name": "Hero Background Image",
  "key": "image_hero",
  "value": "https://images.unsplash.com/...",
  "valueType": "URL",
  "isEditable": true,
  "metadata": {
    "alt": "Construction site hero image",
    "position": "hero"
  }
}
```

---

## 🎨 Customization

### Want Different Default Images?

**Option 1**: Change in template
- Edit: `backend/src/modules/pages/pages.service.ts`
- Update image URLs in `generateTemplateBlocks()`

**Option 2**: Change per page
- Dashboard → Edit Page
- Change image URL in content blocks

---

## 🚀 Future Features

### Coming Soon:
- ✅ Image upload from dashboard
- ✅ Image library/gallery
- ✅ Image cropping tool
- ✅ Multiple image sizes
- ✅ CDN integration

---

## 🐛 Troubleshooting

### Image Not Showing?
- Check URL is valid
- Verify image is publicly accessible
- Check browser console for errors
- Try different image URL

### Image Too Large?
- Compress image before using
- Use image optimization tools
- Recommended max: 500KB

### Wrong Image Position?
- Check metadata.position field
- Verify image key matches template
- Refresh page after changes

---

## 📞 Support

Need help with images?
- Check image URL is correct
- Verify image is publicly accessible
- Contact development team for upload feature

---

## 🎉 Summary

✅ **Automatic images** in all templates  
✅ **Professional placeholders** from Unsplash  
✅ **Easy to change** from dashboard  
✅ **Per-page customization** supported  
✅ **SEO-friendly** with alt text  

**Marketing team can now manage images without code!** 🖼️
