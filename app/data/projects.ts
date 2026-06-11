import type { ProjectData } from '@/data/types';

export const projects: ProjectData[] = [
  {
    title: 'Mercadona Groceries Bot',
    description: 'Mercadona AI bot that adds groceries to yout cart.',
    paragraphs: ['Longer story paragraph one.', 'Paragraph two.'],
    tech: ['TypeScript', 'Vue', 'AI SDK'],
    status: 'LIVE',
    links: {
      website: 'https://mercadonabot.com',
      github: 'https://github.com/jonaaldas/marcadona_api_agent',
    },
    date: '2026-04-06',
    order: 1,
  },
  {
    title: 'Finance Dashboard',
    description: 'Personal finance dashboard with a live, auto-login sandbox demo.',
    paragraphs: [
      'A Nuxt finance dashboard that syncs bank accounts, credit cards, investments and budgets through Plaid, with transaction categorization, budgets and reports.',
      'The portfolio link is a public sandbox build: it auto-logs you into a demo account and runs Plaid in sandbox mode, so you can click around with fake banks without touching real data.',
    ],
    tech: ['Nuxt', 'Plaid API', 'MySQL', 'Drizzle', 'AI SDK'],
    status: 'LIVE',
    links: {
      website: 'https://money.sandbox.aldas.dev',
      github: 'https://github.com/jonaaldas/new_money_dashboard',
    },
    date: '2026-04-06',
    order: 2,
  },
  {
    title: 'Playlist CLI',
    description: 'A Go CLI that transfers playlists between Spotify and Apple Music, in either direction.',
    paragraphs: [
      'A Cobra-based command-line tool that moves playlists and liked songs between Spotify and Apple Music. It matches tracks ISRC-first with an artist + title fallback, handles OAuth for both services, and backs off automatically on API rate limits.',
      'Shipped as cross-platform binaries via GoReleaser and a Homebrew tap — install with `brew install jonaaldas/tap/playlist`.',
    ],
    tech: ['Go', 'Cobra', 'OAuth', 'GoReleaser'],
    status: 'LIVE',
    links: {
      github: 'https://github.com/jonaaldas/playlist',
    },
    date: '2026-06-11',
    order: 3,
  },
  {
    title: 'Claude Code Sessions',
    description: 'A self-hosted dashboard that records and lets you resume every Claude Code session.',
    paragraphs: [
      'Claude Code stores each session as a JSONL transcript on disk but gives you no overview. This watches that directory and ingests every session — title, repo, git branch, linked PR, message count and timestamps — into a Turso database.',
      'A Vue + shadcn-vue table makes the whole pile searchable and always-current, so you can find and resume any past session with one click.',
    ],
    tech: ['Vue', 'Vite', 'TypeScript', 'Turso', 'Vercel'],
    status: 'LIVE',
    links: {
      website: 'https://session-claude.aldas.dev',
      github: 'https://github.com/jonaaldas/claude-code-sessions',
    },
    date: '2026-06-11',
    order: 4,
  },
];
