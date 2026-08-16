FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER 1000
EXPOSE 5003
CMD ["node", "server.js"]
