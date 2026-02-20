# AIDEN v2 Desktop — Implementation Progress

## Completed ✅

### 1. Memory Adapter
- Local (SQLite via Prisma) — full CRUD, enrichContext, stats
- Remote (HTTP) — mapped to server endpoints
- IPC handler: `projectMemory.*`, `memoryUsage.*`
- Prisma schema: `ProjectMemory`, `MemoryUsage` models added
- Tests: ✅ (via mock transport)

### 2. Agent System
- `AgentService` in Electron main — spawns Claude Code CLI
- Session management: start, pause (SIGSTOP), resume (SIGCONT), cancel (SIGTERM)
- Output streaming via IPC events (`agent:output`, `agent:completed`, `agent:failed`)
- IPC handlers: `agent:spawn`, `agent:pause`, `agent:resume`, `agent:cancel`, `agent:list`, `agent:get`
- Transport adapter: local (IPC) and remote (HTTP)
- Tests: ✅

### 3. Terminal System
- `TerminalService` with node-pty (gracefully stubbed when unavailable)
- PTY spawning, write, resize, kill
- IPC handlers: `terminal:spawn`, `terminal:write`, `terminal:resize`, `terminal:kill`, `terminal:list`
- Transport adapter (local only)
- Tests: ✅

### 4. Git Operations
- `GitService` using `simple-git`
- Operations: status, init, commit, branch, checkout, push, pull, diff, log, add
- IPC handlers for all operations
- Transport adapter: local (IPC) and remote (HTTP)
- Tests: ✅

### 5. Stream Adapter
- Local: IPC-based streaming with `stream:data`, `stream:done`, `stream:error` events
- Remote: SSE/fetch streaming from server
- `onData`, `onDone`, `onError` callbacks
- Routes to AI service for chat/generation endpoints
- Tests: ✅

### 6. AI Service
- Direct API calls to Anthropic & OpenAI from Electron main
- Streaming support (Anthropic SSE) via IPC events
- Reads API keys from user settings (Prisma SQLite)
- IPC handlers: `ai:chat`, `ai:stream`, `ai:cancel`
- Tests: ✅

### 7. Database IPC Handler (Complete)
Covers ALL Prisma models:
- projects, epics, stories, specs, activities ✅
- agentSessions, agentLogs ✅
- chatSessions, chatMessages ✅
- userSettings ✅
- projectMemory, memoryUsage ✅
- promptTemplates ✅

### 8. Remote Transport (Complete HTTP Mapping)
- All CRUD endpoints mapped
- JWT auth header injection ✅
- SSE streaming for remote streams ✅
- Agents, chat, memory, git, AI, GitHub endpoints ✅

### 9. Config & Settings IPC
- `config:get`, `config:set` for app config ✅
- `settings:get`, `settings:update` for user settings ✅
- API keys stored via Prisma (secure storage via Electron safeStorage TODO for production)

### 10. GitHub Integration
- `GitHubService` using @octokit/rest ✅
- Token-based auth (authenticate, persist) ✅
- Repo listing, branch listing, clone ✅
- IPC handlers ✅

### 11. React Query Hooks
- `useAgentSessions`, `useSpawnAgent`, `useAgentStream` ✅
- `useGitStatus`, `useGitCommit`, `useGitBranch`, `useGitLog`, `useGitDiff`, `useGitAdd`, `useGitCheckout` ✅
- `useChatSessions`, `useChatMessages`, `useCreateChatSession`, `useSendChatMessage` ✅
- `useCoworkerChat` ✅
- `usePromptTemplates`, CRUD hooks ✅
- `useMemory`, `useMemoryStats`, `useEnrichContext` ✅
- `useGitHubUser`, `useGitHubRepos`, `useGitHubBranches`, `useGitHubClone` ✅
- `useSettings`, `useUpdateSettings` ✅

### 12. Test Page
- Core tests (project/epic/story CRUD, settings, chat, memory) ✅
- Git tests ✅
- Agent test ✅
- Stream test ✅
- Mode switching ✅

## Build Status
- `tsc --noEmit`: ✅ passes
- `vite build`: ✅ passes
- `vitest run`: ✅ 20 tests pass

## Known TODOs
- `node-pty` requires native build — stubbed in container env
- Electron safeStorage for API keys (production enhancement)
- GitHub OAuth flow via deep links (currently token-based only)
- ChatArtifacts, CoworkerConversations — Prisma models not yet in schema
- Socket.IO real-time events for remote mode
- Some v2 server endpoints not yet implemented server-side
