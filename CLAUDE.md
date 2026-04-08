# Task API — Claude Code Instructions

Task management REST API (Express + TypeScript + Zod). In-memory storage, no database. Created for learning purposes.

## Commands

- `pnpm dev` — Dev server (tsx watch mode)
- `pnpm test` — Vitest
- `pnpm build` — tsc to dist/
- `pnpm lint` — ESLint 9

## Coding Conventions

- TypeScript strict mode
- Validate all inputs with Zod schemas (`src/utils/validate.ts`)
- Explicit return types on exported functions
- Commits in English, conventional commits format

## Limitations

- In-memory store only — data lost on restart
- No auth, no rate limiting, no CORS, no logging middleware

## Claude Code Skills
- Skills liegen in `.claude/skills/<name>/SKILL.md`
- NICHT in `.claude/commands/` (veraltet)
- NICHT als `.claude/skills/<name>.md` (falsche Struktur)
