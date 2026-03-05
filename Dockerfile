FROM node:22-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Production image — same base so better-sqlite3 native binary is compatible
FROM node:22-slim AS production
WORKDIR /app

COPY --from=build /app/.output /app

EXPOSE 3000/tcp
CMD [ "node", "/app/server/index.mjs" ]
