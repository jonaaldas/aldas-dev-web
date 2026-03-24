# aldas.dev

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Content

Site data is loaded from `content/` via `@nuxt/content`.
The content folders are intentionally empty so you can add your own entries.

## Deploy To Vercel

This project is ready for Vercel's standard Nuxt deployment flow:

1. Import the repository into Vercel.
2. Keep the detected Nuxt build settings.
3. Add the environment variables from `.env.example`.
