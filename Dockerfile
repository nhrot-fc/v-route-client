############################################################
# Stage 1 – BUILD                                           #
############################################################
FROM node:20-alpine AS builder

# 1. Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Prepare work directory
WORKDIR /app

# 3. Copy lockfile & package manifests first (better cache)
COPY pnpm-lock.yaml package.json ./
COPY apps/*/package.json ./apps/*/
# If you use a monorepo/workspaces, copy other manifest files here

# 4. Install dependencies (no dev layout yet)
RUN pnpm install --frozen-lockfile

# 5. Copy the rest of the source and build
COPY . .
RUN pnpm run build          # --> .next/standalone + .next/static

############################################################
# Stage 2 – RUNTIME                                         #
############################################################
FROM node:20-alpine AS runner

# Smaller image: only node_modules needed at runtime
ENV NODE_ENV=production
WORKDIR /app

# 1. Copy production node_modules & built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# If your app needs .env files, copy or mount them separately

# 2. Port where Next.js will listen
EXPOSE 3000

# 3. Start the server
CMD ["pnpm", "run", "start"]
