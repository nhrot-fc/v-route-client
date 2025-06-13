############################################################
# Stage 1 – BUILD
############################################################
FROM node:20-alpine AS builder

# Instala pnpm mediante corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copia únicamente los archivos de dependencia para aprovechar caché
COPY package.json pnpm-lock.yaml ./
#  ─ Si tuviera workspaces, añada también:  COPY pnpm-workspace.yaml ./

# 2. Instala dependencias en modo producción + build-support
RUN pnpm install --frozen-lockfile

# 3. Copia el resto del código fuente
COPY . .

# 4. Compila el artefacto de producción
RUN pnpm run build          # genera .next/

# Stage 2 – Runtime
############################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos únicamente el bundle standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public        ./public

EXPOSE 3000
CMD ["node", "server.js"]