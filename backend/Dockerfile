# ─────────────────────────────────────────────────────────────
# API (NestJS) — imagen multi-stage optimizada para producción
# ─────────────────────────────────────────────────────────────

# --- Etapa 1: build ---
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: runtime ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV STAGE=prod

# `tini` como PID 1: reparte señales y limpia procesos zombie.
RUN apt-get update && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Solo dependencias de producción, compiladas para linux dentro de la imagen.
# (No se copian los node_modules del build + `npm prune`: eso rompe los
#  binarios por plataforma de `sharp`.)
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static

# Ejecuta como usuario sin privilegios (la imagen node ya trae el usuario `node`).
RUN chown -R node:node /app
USER node

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# El esquema lo gestionan las migraciones SQL de supabase/ (fuera de esta imagen).
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main"]
