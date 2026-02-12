FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY server ./server
COPY server.js ./server.js

RUN mkdir -p /app/data/uploads

EXPOSE 3000

CMD ["node", "server/index.js"]
