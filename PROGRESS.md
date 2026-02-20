# AIDEN v2 Desktop - Progress

## ✅ Completed

### A. Electron + Vite Scaffold
- [x] Vite 6 + React 19 + TypeScript
- [x] Electron main process entry
- [x] Preload script with contextBridge
- [x] Tailwind CSS 4 configured
- [x] electron-builder config
- [x] Dev mode (Vite dev server in Electron)
- [x] Prod mode (built files)

### B. Transport Middleware
- [x] Transport interface with adapters (db, events, stream, fs, auth)
- [x] Local transport (Electron IPC → SQLite)
- [x] Remote transport (HTTP → NestJS server)
- [x] Hybrid mode support
- [x] Transport factory with auto-detection
- [x] Transport-aware fetch utility
- [x] React context + hooks (TransportProvider, useTransport)
- [x] Runtime mode switching

### C. Local Database
- [x] Prisma schema (SQLite, mirrors server's PostgreSQL schema)
- [x] Auto-initialization on first run
- [x] Local demo user creation
- [x] All CRUD operations via IPC

### D. IPC Handlers
- [x] Database handler (all entities: projects, epics, stories, specs, etc.)
- [x] Filesystem handler (read, write, readDir, exists, mkdir, remove, selectDir)
- [x] Stream handler (start, cancel, events)
- [x] Terminal handler (stubbed - spawn, write, resize, kill)
- [x] Config handler (get, set)
- [x] Shell handler (openExternal)

### E. Preload Script
- [x] electronAPI with all adapters
- [x] Channel validation
- [x] Event subscription (on, once)

### F. React Side
- [x] Entry point + App with providers
- [x] TransportProvider + QueryClientProvider
- [x] React Query hooks (projects, epics, stories)
- [x] Test page with CRUD tests + raw JSON output

### G. Testing
- [x] Vitest configured
- [x] Transport factory tests
- [x] Remote transport HTTP tests
- [x] Type validation tests

### H. Dev Environment
- [x] docker-compose.yaml (PostgreSQL)
- [x] npm scripts (dev, build, test, package)
- [x] .env.example
- [x] README.md

### I. Documentation
- [x] docs/TRANSPORT.md
- [x] docs/IPC.md
- [x] docs/DEV.md
- [x] PROGRESS.md

## 🔲 Future Work
- [ ] Socket.IO integration for real-time events in remote mode
- [ ] node-pty for real terminal support
- [ ] Auto-updater setup
- [ ] E2E tests with Playwright
- [ ] GitHub OAuth deep linking
