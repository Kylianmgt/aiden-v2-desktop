# Transport Middleware Architecture

## Overview

The transport layer abstracts communication between the renderer (React) and data sources. It supports three modes:

- **local**: Everything via Electron IPC → SQLite. No server needed.
- **remote**: Everything via HTTP/WebSocket → NestJS server (PostgreSQL).
- **hybrid**: Files/terminal local via IPC, data from server via HTTP.

## Architecture

```
┌──────────────────────────────┐
│  React Components            │
│  (useTransport, React Query) │
└──────────┬───────────────────┘
           │
┌──────────▼───────────────────┐
│  Transport Interface         │
│  db | events | stream | fs   │
└──────────┬───────────────────┘
           │
     ┌─────┴──────┐
     │             │
┌────▼─────┐ ┌────▼──────┐
│  Local   │ │  Remote   │
│ (IPC)    │ │ (HTTP)    │
└────┬─────┘ └────┬──────┘
     │             │
┌────▼─────┐ ┌────▼──────┐
│  SQLite  │ │  NestJS   │
│  (main)  │ │  Server   │
└──────────┘ └───────────┘
```

## Mode Switching

```typescript
const { switchMode } = useTransport()

// Switch at runtime
await switchMode('remote')
await switchMode('local')
await switchMode('hybrid')
```

## Adapters

| Adapter | Local | Remote |
|---------|-------|--------|
| db | IPC → Prisma/SQLite | HTTP → NestJS API |
| events | IPC events | Socket.IO |
| stream | IPC streaming | HTTP SSE |
| fs | IPC → Node.js fs | HTTP API |
| auth | Local demo user | JWT auth |

## Transport Fetch

`transportFetch()` in `fetch.ts` provides a unified fetch that auto-routes:
- In Electron: maps API routes to IPC operations
- In browser: standard HTTP fetch to server
