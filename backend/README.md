# ReactCMS Backend — Production NestJS API

## Stack
- **NestJS** — Modular architecture
- **PostgreSQL + Prisma ORM** — Database
- **Redis + BullMQ** — Job queues
- **Playwright** — Headless React crawler
- **OpenAI GPT-4** — Content segmentation & AI analysis
- **JWT + RBAC** — Auth & authorization
- **Docker** — Container deployment

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy env and configure
cp .env.example .env
# Edit .env with your DB, Redis, OpenAI keys

# 3. Run with Docker (recommended)
docker-compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Start dev server
npm run start:dev
```

## API Docs
> http://localhost:3001/docs (Swagger UI)

## Architecture

```
POST /api/v1/projects          → Create site project
POST /api/v1/crawler/start     → Start AI crawl
GET  /api/v1/crawler/jobs/:id/status → Crawl progress

# After crawl completes (auto via BullMQ workers):
GET  /api/v1/pages/project/:id → All discovered pages
GET  /api/v1/pages/:id         → Page + all content blocks
PUT  /api/v1/content-blocks/:id → Edit a content block
PUT  /api/v1/seo/:pageId       → Update SEO metadata
POST /api/v1/pages/:id/publish → Publish page

GET  /api/v1/analytics/project/:id → Stats
GET  /api/v1/jobs              → Background job monitor
```

## System Flow

```
URL Input → CrawlerQueueService → BullMQ (crawl-queue)
         → CrawlWorker → CrawlerService (Playwright)
         → Crawls all pages → Saves to DB
         → Queues AI jobs (ai-analysis-queue)
         → AiAnalysisWorker → AiService (GPT-4)
         → Segments components → Saves ContentBlocks + SEO
         → Dashboard reflects data instantly
```

## Folder Structure

```
backend/src/modules/
├── auth/           JWT auth, RBAC guards, decorators
├── users/          User management
├── projects/       Site/project CRUD
├── crawler/        Playwright crawler engine + BullMQ queue
├── pages/          Page CRUD + version history + rollback
├── content-blocks/ Editable block CRUD + bulk update
├── seo/            SEO metadata + score calculator
├── ai/             OpenAI integration + AI analysis worker
├── jobs/           BullMQ job monitoring API
├── media/          File upload + media library
└── analytics/      Page view analytics
```
