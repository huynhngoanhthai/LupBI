# Dùng Node 20 alpine làm base image
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Stage 1: Build stage
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @lupbi/web build

# Stage 2: Runner stage (Production Next.js server)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/web/.next ./apps/web/.next

EXPOSE 3000

CMD ["pnpm", "--filter", "@lupbi/web", "start"]
