##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

COPY prisma ./prisma
RUN yarn

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn run postinstall && SKIP_ENV_VALIDATION=1 yarn run build

##### RUNNER

# FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app


ENV NODE_ENV production

# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["server.js"]