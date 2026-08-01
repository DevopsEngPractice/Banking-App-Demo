FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./* \
 && sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf \
 && touch /var/run/nginx.pid \
 && chown -R nginx:nginx /usr/share/nginx/html \
 && chown -R nginx:nginx /var/cache/nginx \
 && chown -R nginx:nginx /var/log/nginx \
 && chown -R nginx:nginx /etc/nginx/conf.d \
 && chown nginx:nginx /var/run/nginx.pid

COPY --from=build /app/build .

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s \
CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]