# IPC Channels

## Request/Response (ipcMain.handle)

### Database
- `db:query` → `{ operation: string, params: any }` → result
  - Operations: `projects.list`, `projects.get`, `projects.create`, `projects.update`, `projects.delete`
  - Same pattern for: `epics`, `stories`, `specs`, `agentSessions`, `chatSessions`, `chatMessages`, `userSettings`, `activities`

### Filesystem
- `fs:readFile` → path → string
- `fs:writeFile` → (path, content) → void
- `fs:readDir` → path → DirectoryEntry[]
- `fs:exists` → path → boolean
- `fs:mkdir` → (path, recursive?) → void
- `fs:remove` → path → void
- `fs:selectDirectory` → void → string | null

### Streaming
- `stream:start` → (endpoint, data) → streamId
- `stream:cancel` → streamId → void

### Terminal (stubbed)
- `terminal:spawn` → options → TerminalSession
- `terminal:write` → (sessionId, data) → boolean
- `terminal:resize` → (sessionId, cols, rows) → boolean
- `terminal:kill` → sessionId → boolean

### App
- `app:version` → void → string
- `app:path` → name → string
- `config:get` → void → AppConfig
- `config:set` → updates → AppConfig
- `shell:openExternal` → url → void

## Events (ipcRenderer.on)

- `stream:data` → { streamId, type, content }
- `stream:done` → { streamId }
- `stream:error` → { streamId, error }
- `terminal:started` → { sessionId }
- `terminal:output` → { sessionId, data }
- `terminal:closed` → { sessionId }
- `agent:*` → agent lifecycle events
- `app:*` → update events
