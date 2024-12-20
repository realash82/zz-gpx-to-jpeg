FROM node:slim
WORKDIR /app

RUN apt-get update
RUN apt-get install -y chromium chromium-driver default-jre
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
COPY . .
RUN npm run lint
RUN npm run test
RUN npm run build

ENTRYPOINT ["node", "build/index.js"]