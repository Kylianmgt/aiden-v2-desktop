# AIDEN v2 Desktop — IPC Channel Reference

## Database
| Channel | Direction | Description |
|---------|-----------|-------------|
| `db:query` | renderer→main | Generic database query. Params: `{ operation, params }` |

### Operations
- `projects.list`, `projects.get`, `projects.getBySlug`, `projects.create`, `projects.update`, `projects.delete`
- `epics.list`, `epics.get`, `epics.create`, `epics.update`, `epics.delete`
- `stories.list`, `stories.get`, `stories.create`, `stories.update`, `stories.delete`
- `specs.list`, `specs.get`, `specs.create`, `specs.update`
- `agentSessions.list`, `agentSessions.get`, `agentSessions.create`, `agentSessions.update`
- `agentLogs.list`, `agentLogs.create`
- `chatSessions.list`, `chatSessions.get`, `chatSessions.create`, `chatSessions.update`, `chatSessions.delete`
- `chatMessages.list`, `chatMessages.create`
- `activities.list`, `activities.create`
- `userSettings.get`, `userSettings.upsert`
- `projectMemory.list`, `projectMemory.get`, `projectMemory.create`, `projectMemory.update`, `projectMemory.delete`
- `memoryUsage.list`, `memoryUsage.create`, `memoryUsage.update`
- `promptTemplates.list`, `promptTemplates.get`, `promptTemplates.create`, `promptTemplates.update`, `promptTemplates.delete`

## Agent
| Channel | Direction | Description |
|---------|-----------|-------------|
| `agent:spawn` | renderer→main | Spawn an agent session |
| `agent:pause` | renderer→main | Pause an agent |
| `agent:resume` | renderer→main | Resume a paused agent |
| `agent:cancel` | renderer→main | Cancel an agent |
| `agent:list` | renderer→main | List active agent sessions |
| `agent:get` | renderer→main | Get agent session details |

### Agent Events (main→renderer)
| Channel | Description |
|---------|-------------|
| `agent:created` | Agent session created |
| `agent:started` | Agent started executing |
| `agent:output` | Agent output (stdout/stderr) |
| `agent:completed` | Agent finished successfully |
| `agent:failed` | Agent failed |
| `agent:paused` | Agent paused |
| `agent:cancelled` | Agent cancelled |

## Terminal
| Channel | Direction | Description |
|---------|-----------|-------------|
| `terminal:spawn` | renderer→main | Spawn a PTY session |
| `terminal:write` | renderer→main | Write data to terminal |
| `terminal:resize` | renderer→main | Resize terminal |
| `terminal:kill` | renderer→main | Kill terminal session |
| `terminal:list` | renderer→main | List active terminals |

### Terminal Events (main→renderer)
| Channel | Description |
|---------|-------------|
| `terminal:started` | Terminal session started |
| `terminal:output` | Terminal output data |
| `terminal:closed` | Terminal session closed |
| `terminal:error` | Terminal error |

## Stream
| Channel | Direction | Description |
|---------|-----------|-------------|
| `stream:start` | renderer→main | Start a streaming operation |
| `stream:cancel` | renderer→main | Cancel a stream |

### Stream Events (main→renderer)
| Channel | Description |
|---------|-------------|
| `stream:data` | Stream data chunk `{ streamId, type, content }` |
| `stream:done` | Stream completed `{ streamId }` |
| `stream:error` | Stream error `{ streamId, error }` |

## Git
| Channel | Direction | Description |
|---------|-----------|-------------|
| `git:status` | renderer→main | Get git status for a directory |
| `git:init` | renderer→main | Initialize git repo |
| `git:commit` | renderer→main | Create a commit |
| `git:diff` | renderer→main | Get diff |
| `git:log` | renderer→main | Get commit log |
| `git:branch` | renderer→main | Get branch info |
| `git:checkout` | renderer→main | Checkout branch |
| `git:push` | renderer→main | Push to remote |
| `git:pull` | renderer→main | Pull from remote |
| `git:add` | renderer→main | Stage files |

## AI
| Channel | Direction | Description |
|---------|-----------|-------------|
| `ai:chat` | renderer→main | Non-streaming AI chat |
| `ai:stream` | renderer→main | Start streaming AI chat |
| `ai:cancel` | renderer→main | Cancel AI stream |

## GitHub
| Channel | Direction | Description |
|---------|-----------|-------------|
| `github:authenticate` | renderer→main | Authenticate with GitHub token |
| `github:user` | renderer→main | Get authenticated user |
| `github:repos` | renderer→main | List repos |
| `github:branches` | renderer→main | List repo branches |
| `github:clone` | renderer→main | Clone a repository |

## Config & Settings
| Channel | Direction | Description |
|---------|-----------|-------------|
| `config:get` | renderer→main | Get app config |
| `config:set` | renderer→main | Update app config |
| `settings:get` | renderer→main | Get user settings |
| `settings:update` | renderer→main | Update user settings |

## App
| Channel | Direction | Description |
|---------|-----------|-------------|
| `app:version` | renderer→main | Get app version |
| `app:path` | renderer→main | Get system paths |

## Filesystem
| Channel | Direction | Description |
|---------|-----------|-------------|
| `fs:readFile` | renderer→main | Read a file |
| `fs:writeFile` | renderer→main | Write a file |
| `fs:readDir` | renderer→main | Read directory contents |
| `fs:exists` | renderer→main | Check if path exists |
| `fs:mkdir` | renderer→main | Create directory |
| `fs:remove` | renderer→main | Remove file/directory |
| `fs:selectDirectory` | renderer→main | Open directory picker dialog |

## Shell
| Channel | Direction | Description |
|---------|-----------|-------------|
| `shell:openExternal` | renderer→main | Open URL in system browser |
| `shell:showItemInFolder` | renderer→main | Show file in file manager |
