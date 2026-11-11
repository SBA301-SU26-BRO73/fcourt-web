FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Same-origin API: the browser calls /api and nginx proxies it, so no CORS is needed.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# envsubst renders this template at container start (official nginx image feature).
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV API_UPSTREAM=http://gateway:8080
ENV NGINX_RESOLVER=127.0.0.11

EXPOSE 80
