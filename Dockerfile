FROM node:20-alpine as build

WORKDIR /app

ADD ./build.js /app/build.js
ADD ./tsconfig.json /app/tsconfig.json
ADD ./svelte.config.js /app/svelte.config.js
ADD ./vite.config.ts /app/vite.config.ts
ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
ADD ./src /app/src
ADD ./static /app/static

ARG VITE_CONSOLE_MODE
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_GROWTH_ENDPOINT
ARG VITE_STRIPE_PUBLIC_KEY

ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_GROWTH_ENDPOINT=$VITE_APPWRITE_GROWTH_ENDPOINT
ENV VITE_CONSOLE_MODE=$VITE_CONSOLE_MODE
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

RUN npm ci
RUN npm run build

FROM nginx:1.25-alpine

EXPOSE 3000

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/console
