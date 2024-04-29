FROM node:20-alpine as build

ADD ./build.js /app/build.js
ADD ./tsconfig.json /app/tsconfig.json
ADD ./svelte.config.js /app/svelte.config.js
ADD ./vite.config.ts /app/vite.config.ts
ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
ADD ./src /app/src
ADD ./static /app/static

WORKDIR /app

ENV VITE_APPWRITE_ENDPOINT=https://stage.cloud.appwrite.io/v1
ENV VITE_APPWRITE_GROWTH_ENDPOINT=
ENV VITE_GA_PROJECT=
ENV VITE_CONSOLE_MODE=cloud
ENV VITE_STRIPE_PUBLIC_KEY=pk_test_51LT5nsGYD1ySxNCyd7b304wPD8Y1XKKWR6hqo6cu3GIRwgvcVNzoZv4vKt5DfYXL1gRGw4JOqE19afwkJYJq1g3K004eVfpdWn

RUN npm ci
RUN npm run build

FROM nginx:1.25-alpine
EXPOSE 3000
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html/console
