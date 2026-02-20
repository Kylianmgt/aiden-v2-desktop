# Development Guide

## Prerequisites
- Node.js 22+
- npm 10+

## Setup

```bash
npm install
npx prisma generate
```

## Development

### Vite only (browser mode, remote transport)
```bash
npm run dev
```

### Electron + Vite (desktop mode, local transport)
```bash
npm run dev:electron
```

## Testing
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## Type Checking
```bash
npm run typecheck          # Renderer code
npm run typecheck:electron # Electron main process
```

## Build
```bash
npm run build      # Build renderer + electron
npm run package    # Package with electron-builder
```

## Database

Local SQLite is auto-created on first run. To reset:
```bash
rm aiden-local.db
npx prisma db push
```

## Architecture
- `electron/main/` — Electron main process (IPC handlers, services)
- `src/lib/transport/` — Transport abstraction (local/remote/hybrid)
- `src/lib/queries/` — React Query hooks
- `src/pages/test.tsx` — Transport test page
