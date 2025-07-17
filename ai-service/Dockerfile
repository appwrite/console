FROM --platform=$BUILDPLATFORM node:22-alpine

RUN apk add --no-cache git
RUN apk add --no-cache bash

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

CMD ["pnpm", "run", "start"]