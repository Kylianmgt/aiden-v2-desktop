# AIDEN v2 Desktop

Electron + Vite desktop app for AIDEN — AI Development Environment & Navigator.

## Features
- **Local mode**: Standalone with SQLite, no server needed
- **Remote mode**: Connect to NestJS server (PostgreSQL)
- **Hybrid mode**: Local files/terminal, remote data
- Transport middleware that abstracts communication layer
- Full CRUD for projects, epics, stories, specs

## Quick Start

```bash
npm install
npx prisma generate
npm run dev:electron   # Electron + Vite
# or
npm run dev            # Browser only (remote mode)
```

## Docs
- [Transport Architecture](docs/TRANSPORT.md)
- [IPC Channels](docs/IPC.md)
- [Development Guide](docs/DEV.md)

## Stack
- Electron 33+ / Vite 6 / React 19 / TypeScript
- Prisma + SQLite (local) / PostgreSQL (server)
- TanStack React Query
- Tailwind CSS 4
