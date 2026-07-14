FROM node:22-alpine AS build

RUN npm install -g pnpm@10.29.3

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

COPY . .

ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_AUTH_URL

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_AUTH_URL=$EXPO_PUBLIC_AUTH_URL

RUN npx expo export --platform web

# Post-process: replace import.meta.env (used by zustand devtools) with safe expression
# to avoid "Cannot use 'import.meta' outside a module" in non-module scripts
RUN node -e "const fs=require('fs');const path=require('path');const dir='/app/dist';function walk(d){fs.readdirSync(d).forEach(f=>{const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.js'))fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/import\.meta\.env/g,'({})'));});}walk(dir);"

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
