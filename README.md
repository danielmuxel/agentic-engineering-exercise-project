# Task API

Simple REST API for task management. Built with Express + TypeScript + Zod.

## Setup

```bash
pnpm install
pnpm dev
```

## Endpoints

- `GET /tasks` — List all tasks
- `POST /tasks` — Create a task (body: `{ title, description?, priority? }`)
- `GET /tasks/:id` — Get a single task
- `PUT /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task

## Stack

- Express 4 + TypeScript
- Zod for validation
- Vitest for tests
- In-memory storage (no database)

## Structure

```
src/
  server.ts       — Express server setup
  api/
    tasks.ts      — Route handlers
  utils/
    validate.ts   — Zod schemas and validation
  config/
    index.ts      — App configuration
```
