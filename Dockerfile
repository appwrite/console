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

ARG PUBLIC_CONSOLE_MODE
ARG PUBLIC_APPWRITE_ENDPOINT
ARG PUBLIC_APPWRITE_GROWTH_ENDPOINT
ARG PUBLIC_STRIPE_KEY

ENV PUBLIC_APPWRITE_ENDPOINT=$PUBLIC_APPWRITE_ENDPOINT
ENV PUBLIC_APPWRITE_GROWTH_ENDPOINT=$PUBLIC_APPWRITE_GROWTH_ENDPOINT
ENV PUBLIC_CONSOLE_MODE=$PUBLIC_CONSOLE_MODE
ENV PUBLIC_STRIPE_KEY=$PUBLIC_STRIPE_KEY

RUN pnpm run sync && pnpm run build

FROM nginx:1.25-alpine

EXPOSE 80

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/console