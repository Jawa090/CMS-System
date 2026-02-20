# Delete Project & Re-crawl Workflow

## Understanding the Flow

### What Happens When You Delete a Project?
When you delete a project, the backend automatically deletes:
- ✅ All pages associated with that project
- ✅ All content blocks for those pages
- ✅ All SEO metadata
- ✅ All media files
- ✅ All crawl jobs and crawled pages

This is a **CASCADE DELETE** - everything related to the project is removed.

### Why You Get 404 Errors After Deleting?
The error you're seeing:
```
GET http://localhost:3001/api/v1/pages/by-path?path=%2Fpricing%2F 404 (Not Found)
```

This happens because:
1. You deleted the project
2. All pages (including `/pricing/`) were deleted
3. Your frontend is trying to load content for a page that no longer exists

## Complete Workflow

### Step 1: Delete Old Project
1. Go to **Dashboard → Settings**
2. Click the **Delete** button on the project you want to remove
3. Confirm the deletion
4. All data is permanently removed

### Step 2: Create New Project & Crawl
1. Go to **Dashboard → Crawler**
2. Enter your site URL (e.g., `http://localhost:5173`)
3. Click **Start Crawl**
4. Wait for the crawl to complete

### Step 3: Automatic Conversion
The system automatically:
1. Crawls all pages and saves to `crawledPage` table
2. Converts crawled pages to `Page` records
3. Extracts content blocks from HTML
4. Creates SEO metadata
5. Makes pages available for editing

### Step 4: Edit Content
1. Go to **Dashboard → Pages**
2. Select the page you want to edit (e.g., `/pricing/`)
3. Edit content blocks
4. Save changes
5. View live preview

## Important Notes

### Database Structure
```
Project (1)
  └── Pages (many)
       ├── ContentBlocks (many)
       ├── SEO Metadata (1)
       └── Components (many)
```

### Crawl Process
```
1. Start Crawl → CrawlJob created
2. Crawl Pages → CrawledPage records created
3. Convert → Page records created
4. Extract → ContentBlock records created
5. Analyze → AI analysis (optional)
```

### Why This Design?
- **Separation of Concerns**: Crawled data vs. editable content
- **Version Control**: Keep original crawled data
- **Re-crawl Safety**: Can re-crawl without losing edits
- **Data Integrity**: Cascade deletes prevent orphaned records

## Troubleshooting

### Problem: 404 errors on all pages
**Solution**: You need to crawl your site first to create pages

### Problem: Content not updating
**Solution**: Make sure you're editing the correct project's pages

### Problem: Pages missing after delete
**Solution**: This is expected - re-crawl to recreate them

### Problem: Can't delete project
**Solution**: Check if there are active crawl jobs running

## Quick Commands

### Check if pages exist:
```bash
# In backend directory
npx prisma studio
# Navigate to Page table and check records
```

### Re-crawl specific pages:
Use the crawler panel in the dashboard to crawl individual URLs

### Reset everything:
```bash
# In backend directory
npx prisma migrate reset
npm run seed  # if you have seed data
```
