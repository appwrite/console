FROM --platform=$BUILDPLATFORM node:20-alpine AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ADD ./package.json /app/package.json
ADD ./pnpm-lock.yaml /app/pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ADD ./build.js /app/build.js
ADD ./tsconfig.json /app/tsconfig.json
ADD ./svelte.config.js /app/svelte.config.js
ADD ./vite.config.ts /app/vite.config.ts
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

RUN pnpm run sync && pnpm run build

FROM nginx:1.25-alpine

EXPOSE 80

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/console