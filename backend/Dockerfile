FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install Playwright dependencies
FROM base AS playwright-deps
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Builder stage
FROM playwright-deps AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM playwright-deps AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN mkdir -p uploads logs

EXPOSE 3001

CMD ["node", "dist/main"]
