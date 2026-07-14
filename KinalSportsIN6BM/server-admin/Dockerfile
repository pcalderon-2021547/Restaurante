FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --ignore-scripts

COPY . .

EXPOSE 3006

CMD ["node", "index.js"]
