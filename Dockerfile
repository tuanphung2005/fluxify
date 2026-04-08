FROM oven/bun:1 AS deps
WORKDIR /app

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fluxify?schema=public

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

FROM oven/bun:1 AS builder
WORKDIR /app

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fluxify?schema=public
ENV RESEND_API_KEY=re_build_placeholder
ENV CLOUDINARY_CLOUD_NAME=dummy
ENV CLOUDINARY_API_KEY=dummy
ENV CLOUDINARY_API_SECRET=dummy

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/prisma ./prisma
COPY . .

RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app

# Create a non-root user (Hugging Face requires user 1000)
RUN useradd -m -u 1000 user

ENV NODE_ENV=production
ENV PORT=7860

COPY --chown=user:user --from=builder /app/package.json ./package.json
COPY --chown=user:user --from=builder /app/next.config.js ./next.config.js
COPY --chown=user:user --from=builder /app/public ./public
COPY --chown=user:user --from=builder /app/prisma ./prisma
COPY --chown=user:user --from=builder /app/node_modules ./node_modules
COPY --chown=user:user --from=builder /app/.next ./.next

# Switch to the non-root user to run the app
USER user

EXPOSE 7860

CMD ["bun", "run", "start"]