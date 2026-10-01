# ---------- Etapa 1: build da SPA ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: Nginx servindo os arquivos estáticos ----------
FROM nginx:1.27-alpine

# A API é acessada pela mesma origem (/api), encaminhada pelo Nginx.
ENV API_UPSTREAM=http://api:3333

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
