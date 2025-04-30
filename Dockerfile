FROM --platform=$BUILDPLATFORM node:20-alpine AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@10.0.0 --activate

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
ARG PUBLIC_APPWRITE_MULTI_REGION
ARG PUBLIC_APPWRITE_ENDPOINT
ARG PUBLIC_GROWTH_ENDPOINT
ARG PUBLIC_STRIPE_KEY
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_RELEASE

ENV PUBLIC_APPWRITE_ENDPOINT=$PUBLIC_APPWRITE_ENDPOINT
ENV PUBLIC_GROWTH_ENDPOINT=$PUBLIC_GROWTH_ENDPOINT
ENV PUBLIC_CONSOLE_MODE=$PUBLIC_CONSOLE_MODE
ENV PUBLIC_APPWRITE_MULTI_REGION=$PUBLIC_APPWRITE_MULTI_REGION
ENV PUBLIC_STRIPE_KEY=$PUBLIC_STRIPE_KEY
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV NODE_OPTIONS=--max_old_space_size=8192

RUN pnpm run sync && pnpm run build

FROM nginx:1.26.3-alpine

EXPOSE 80

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/console
