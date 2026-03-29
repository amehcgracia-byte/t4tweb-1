# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["pnpm", "start"]
