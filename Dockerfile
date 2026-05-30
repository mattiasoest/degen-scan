FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY . /app

EXPOSE 4000

CMD ["node", "index.js"]