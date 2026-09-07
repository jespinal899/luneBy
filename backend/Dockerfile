# --- Etapa de build ---
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Imagen de ejecución ---
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV STAGE=prod

COPY package*.json ./
# Instala solo dependencias de producción, ya compiladas para linux.
# (No se copian los node_modules del build + `npm prune`: eso rompe los
#  binarios por plataforma de `sharp`.)
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static

EXPOSE 3001
# El esquema lo gestionan las migraciones SQL de supabase/ (fuera de esta imagen).
CMD ["node", "dist/main"]
