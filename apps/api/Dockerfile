# Dùng Node 20 alpine làm base image
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Stage 1: Build stage
FROM base AS builder
WORKDIR /app

# Copy các tệp cấu hình workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @lupbi/api db:generate

# Build ứng dụng API và các packages phụ thuộc
RUN pnpm --filter @lupbi/api build

# Stage 2: Runner stage (môi trường sản xuất gọn nhẹ)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Cài đặt prod dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy kết quả build từ builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

EXPOSE 3001

CMD ["node", "apps/api/dist/src/main.js"]
