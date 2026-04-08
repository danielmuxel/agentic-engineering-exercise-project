# Task API — Claude Code Instructions

## About this project

This is a task management REST API built with Express and TypeScript. It provides CRUD operations for tasks. The project uses Zod for input validation and stores tasks in memory (no database). It was created as a simple backend service for learning purposes.

## Technology Stack

- **Runtime**: Node.js (version 20 or higher recommended)
- **Language**: TypeScript 5.5 with strict mode enabled
- **Framework**: Express 4.21 for HTTP server
- **Validation**: Zod 3.23 for schema validation
- **Testing**: Vitest 2.1 for unit tests
- **Linting**: ESLint 9 for code quality
- **Dev Server**: tsx for TypeScript execution with watch mode
- **Build**: TypeScript compiler (tsc) outputs to dist/
- **Package Manager**: pnpm (recommended) or npm

## Project Structure

The project follows a standard Express project structure:

```
src/
  server.ts           — Main entry point, Express app setup, middleware registration
  api/
    tasks.ts          — Task route handlers (GET, POST, PUT, DELETE)
  utils/
    validate.ts       — Zod schemas (TaskSchema, TaskUpdateSchema), validation functions
  config/
    index.ts          — Application configuration (port, environment)
```

## API Endpoints

The API exposes the following endpoints:

- `GET /tasks` — Returns an array of all tasks
- `POST /tasks` — Creates a new task. Body must contain `title` (string, required), `description` (string, optional), `priority` (enum: "low" | "medium" | "high", defaults to "medium")
- `GET /tasks/:id` — Returns a single task by UUID
- `PUT /tasks/:id` — Updates a task. All fields are optional (partial update)
- `DELETE /tasks/:id` — Deletes a task by UUID. Returns 204 on success
- `GET /health` — Health check endpoint, returns `{ status: "ok", env: "development" }`

## Data Model

A Task has the following fields:
- `id` — UUID string, auto-generated
- `title` — string, 1-200 characters, required
- `description` — string, optional
- `priority` — "low" | "medium" | "high", defaults to "medium"
- `createdAt` — Date, auto-generated
- `completed` — boolean, defaults to false

## How to run

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev`
3. Run tests: `pnpm test`
4. Build for production: `pnpm build`
5. Lint code: `pnpm lint`

## Configuration

The app reads configuration from environment variables:
- `PORT` — Server port (default: 3000)
- `NODE_ENV` — Environment name (default: "development")

Configuration is loaded in `src/config/index.ts`.

## Validation

Input validation uses Zod schemas defined in `src/utils/validate.ts`. The `TaskSchema` validates creation requests, and `TaskUpdateSchema` (partial) validates update requests. Both return structured error objects on failure.

## Error Handling

- 400 Bad Request — When validation fails (returns field-level errors)
- 404 Not Found — When a task ID doesn't exist
- 204 No Content — Successful deletion

## TypeScript Configuration

The project uses TypeScript strict mode with the following settings:
- Target: ES2022
- Module: ESNext
- Module Resolution: bundler
- Strict: true
- esModuleInterop: true
- Output directory: dist/
- Root directory: src/

## Testing

Tests are written with Vitest. Run them with `pnpm test`.

## Coding Conventions

- Use TypeScript strict mode
- Validate all inputs with Zod
- Use explicit return types on exported functions
- Keep functions small and focused
- Commits in English
- Use conventional commits format

## Important Notes

- The task store is in-memory only — data is lost on restart
- No authentication or authorization implemented
- No rate limiting
- CORS is not configured
- No logging middleware installed
