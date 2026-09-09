# ─────────────────────────────────────────────────────────────
# Frontend (React + Vite) → build estático servido con Nginx
# ─────────────────────────────────────────────────────────────

# --- Etapa 1: build ---
FROM node:20-slim AS build
WORKDIR /app

# La URL de la API se hornea en el bundle en tiempo de build.
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: runtime (Nginx) ---
FROM nginx:1.27-alpine AS runtime

# Config con fallback a index.html para el enrutado del SPA.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
