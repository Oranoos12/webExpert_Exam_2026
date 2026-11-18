# Eén image voor de API (app.js) en de consumer (consumer.js)
FROM node:22-alpine

WORKDIR /app

# eerst alleen package.json: zo hergebruikt Docker de npm-laag als je code verandert
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "app.js"]