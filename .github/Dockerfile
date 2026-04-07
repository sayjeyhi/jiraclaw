ARG NODE_OPTIONS="--max-old-space-size=8192"
ARG NEXT_PUBLIC_APP_VERSION="dev"

# --- Base Image ---
FROM node:lts-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build-prep
ARG NODE_OPTIONS
ARG NEXT_PUBLIC_APP_VERSION

COPY package.json pnpm-lock.yaml ./
COPY ./prisma /app/prisma
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_OPTIONS=$NODE_OPTIONS
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

ARG DATABASE_URL=postgresql://localhost:5432/dummy
RUN DATABASE_URL=${DATABASE_URL} pnpm run prisma:generate

# --- Public website image (no /admin UI, no admin API) ---
FROM build-prep AS build-web
RUN pnpm run build


FROM base AS release-web

RUN apt update && apt install -y dumb-init --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=build-web /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && chown -R node:node node_modules

COPY --chown=node:node --from=build-web /app/.next ./.next
COPY --chown=node:node --from=build-web /app/public ./public
COPY --chown=node:node --from=build-web /app/prisma ./prisma
COPY --chown=node:node --from=build-web /app/prisma.config.ts ./prisma.config.ts
COPY --chown=node:node --from=build-web /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=build-web /app/server ./server
COPY --chown=node:node --from=build-web /app/lib ./lib

ENV TZ=UTC
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

USER node

CMD [ "dumb-init", "pnpm", "run", "start" ]

# Default image: public site
FROM release-web