FROM --platform=$BUILDPLATFORM node:20-alpine AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
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
ARG PUBLIC_GROWTH_ENDPOINT
ARG PUBLIC_STRIPE_KEY
ARG SENTRY_AUTH_TOKEN
ARG PUBLIC_PROJECT_PROFILE

ENV PUBLIC_APPWRITE_ENDPOINT=$PUBLIC_APPWRITE_ENDPOINT
ENV PUBLIC_GROWTH_ENDPOINT=$PUBLIC_GROWTH_ENDPOINT
ENV PUBLIC_CONSOLE_MODE=$PUBLIC_CONSOLE_MODE
ENV PUBLIC_STRIPE_KEY=$PUBLIC_STRIPE_KEY
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV PUBLIC_PROJECT_PROFILE=$PUBLIC_PROJECT_PROFILE
ENV NODE_OPTIONS=--max_old_space_size=8192

RUN pnpm run build

FROM nginx:1.25-alpine

EXPOSE 80

COPY docker/nginx.$PUBLIC_PROJECT_PROFILE.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html/console