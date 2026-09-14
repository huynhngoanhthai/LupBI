# ==========================================
# Base Image với pnpm enabled
# ==========================================
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ==========================================
# 1. Builder Stage: Build toàn bộ monorepo
# ==========================================
FROM base AS builder
WORKDIR /app

# Copy các tệp cấu hình workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Cài đặt toàn bộ dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client cho Backend API
RUN pnpm --filter @lupbi/api db:generate

# Build tất cả các apps (API & Web) qua Turborepo
RUN pnpm build

# ==========================================
# 2. Runner Stage: Môi trường Production tập trung
# ==========================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy các file workspace cấu hình
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/web/package.json ./apps/web/
COPY apps/web/next.config.ts ./apps/web/

# Cài đặt production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy kết quả build từ builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000 3001

# Mặc định khởi chạy ứng dụng Monorepo (chạy dev/prod server)
CMD ["pnpm", "dev"]
