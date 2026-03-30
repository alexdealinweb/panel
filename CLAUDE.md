# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EnhanceUI is a web-based hosting control panel built with React/TypeScript that provides a dashboard for managing hosting infrastructure through the [Enhance API](https://apidocs.enhance.com/). It proxies all API requests server-side to keep credentials out of the browser.

## Commands

```bash
# Development (runs Vite dev server on :5173 + Express proxy on :3001)
npm run dev

# Run only the frontend or backend
npm run dev:client    # Vite on :5173
npm run dev:server    # Express proxy on :3001

# Build (TypeScript check + Vite bundle → dist/)
npm run build

# Lint
npm run lint
```

Requires Node 22 (see `.nvmrc`). Copy `.env.example` to `.env` and fill in credentials before running.

## Architecture

### API Proxy Pattern

The browser never holds API credentials. All requests flow through a server-side proxy:

```
React UI → /api/proxy/* → Express (dev) or Vercel Function (prod) → Enhance API
```

- **Local dev**: Express server in `server/index.ts` handles `/api/proxy/*` and `/api/status`
- **Production**: Vercel serverless functions in `api/proxy/[...path].ts` and `api/status.ts`
- **Read-only mode**: `ENHANCE_READ_ONLY=true` (default) blocks POST/PUT/PATCH/DELETE at the proxy layer

### Data Flow

1. Page components in `src/pages/` use custom hooks from `src/api/hooks/`
2. Hooks wrap TanStack React Query (`staleTime: 30s`, `retry: 1`)
3. Query functions call `apiRequest()` from `src/api/enhance/client.ts`
4. Axios client hits `/api/proxy/*` which the server proxies to the Enhance API with Bearer auth

### Key Directories

- `src/api/enhance/` — Axios client, endpoint definitions, TypeScript types, demo data
- `src/api/hooks/` — React Query hooks (one per resource: websites, domains, emails, etc.)
- `src/components/ui/` — Reusable UI primitives (shadcn/ui pattern)
- `src/components/layout/` — Layout shell (sidebar, topbar)
- `src/pages/` — Route pages, organized by feature
- `api/` — Vercel serverless functions (production proxy)
- `server/` — Express dev server (local proxy)

### Routing

React Router v7 with all page components lazy-loaded via `React.lazy()` in `App.tsx`. All routes are nested under a shared `<Layout>` wrapper.

### Path Alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Environment Variables

| Variable | Purpose |
|---|---|
| `ENHANCE_API_URL` | Base URL of the Enhance server |
| `ENHANCE_API_KEY` | Bearer token for API auth (server-side only) |
| `ENHANCE_ORG_ID` | Organization ID for scoped API calls |
| `ENHANCE_READ_ONLY` | `true` (default) blocks write operations at proxy |
| `PORT` | Express proxy port (default 3001) |

## Deployment

Deployed to Vercel. `vercel.json` configures:
- Build: `npm run build:client` → output `dist/`
- Rewrites route `/api/*` to serverless functions and SPA fallback to `index.html`
