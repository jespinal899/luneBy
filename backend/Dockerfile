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
# Reutiliza los node_modules ya compilados (bcrypt) y quita los de desarrollo.
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static

EXPOSE 3001
# Al arrancar, TypeORM aplica las migraciones pendientes (migrationsRun).
CMD ["node", "dist/main"]
