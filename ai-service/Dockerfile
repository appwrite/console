FROM --platform=$BUILDPLATFORM node:22-alpine AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack@latest
RUN corepack enable
RUN corepack prepare pnpm@10.0.0 --activate

ADD ./package.json /app/package.json
ADD ./pnpm-lock.yaml /app/pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ADD ./ /app/

RUN pnpm run build