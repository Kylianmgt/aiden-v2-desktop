// AIDEN v2 - Local Transport (Electron IPC) — Full Implementation

import type {
  Transport, TransportMode, DatabaseAdapter, EventAdapter, StreamAdapter,
  FilesystemAdapter, AuthAdapter, AgentAdapter, TerminalAdapter, MemoryAdapter,
  GitAdapter, AIAdapter, GitHubAdapter,
  Project, CreateProjectData, Epic, CreateEpicData,
  Story, CreateStoryData, StoriesListParams, Spec, CreateSpecData, SpecsListParams,
  Activity, CreateActivityData, ActivitiesListParams, UserSettings, User, DirectoryEntry,
  StreamEvent, StreamResult,
  AgentSession, SpawnAgentOptions, CreateAgentSessionData, AgentSessionsListParams,
  AgentLog, CreateAgentLogData,
  ChatSession, CreateChatSessionData, ChatSessionsListParams,
  ChatMessage, CreateChatMessageData,
  TerminalSession, SpawnTerminalOptions,
  ProjectMemory, MemoryFilter, CreateMemoryData, MemoryUsage, RecordUsageData, EnrichedContext, MemoryStats,
  GitStatus, GitLogEntry, GitBranchInfo,
  AIChatParams,
  GitHubRepo, GitHubUser,
  PromptTemplate, CreatePromptTemplateData,
} from './types'

const LOCAL_USER: User = { id: 'local-demo-user', email: 'demo@aiden.dev', name: 'Demo User' }

function getAPI() {
  if (typeof window === 'undefined' || !window.electronAPI) throw new Error('Electron API not available')
  return window.electronAPI
}

function createDatabaseAdapter(): DatabaseAdapter {
  const api = getAPI()
  return {
    query: <T>(op: string, params?: unknown) => api.db.query<T>(op, params),
    projects: {
      list: (userId?: string) => api.db.query<Project[]>('projects.list', { userId: userId || LOCAL_USER.id }),
      get: (id: string) => api.db.query<Project | null>('projects.get', { id }),
      create: (data: CreateProjectData) => api.db.query<Project>('projects.create', { ...data, userId: data.userId || LOCAL_USER.id }),
      update: (id: string, data: Partial<Project>) => api.db.query<Project>('projects.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('projects.delete', { id }),
    },
    epics: {
      list: (projectId: string) => api.db.query<Epic[]>('epics.list', { projectId }),
      get: (id: string) => api.db.query<Epic | null>('epics.get', { id }),
      create: (data: CreateEpicData) => api.db.query<Epic>('epics.create', data),
      update: (id: string, data: Partial<Epic>) => api.db.query<Epic>('epics.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('epics.delete', { id }),
    },
    stories: {
      list: (params: StoriesListParams) => api.db.query<Story[]>('stories.list', params),
      get: (id: string) => api.db.query<Story | null>('stories.get', { id }),
      create: (data: CreateStoryData) => api.db.query<Story>('stories.create', data),
      update: (id: string, data: Partial<Story>) => api.db.query<Story>('stories.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('stories.delete', { id }),
    },
    specs: {
      list: (params: SpecsListParams) => api.db.query<Spec[]>('specs.list', params),
      get: (id: string) => api.db.query<Spec | null>('specs.get', { id }),
      create: (data: CreateSpecData) => api.db.query<Spec>('specs.create', data),
      update: (id: string, data: Partial<Spec>) => api.db.query<Spec>('specs.update', { id, ...data }),
    },
    activities: {
      list: (params: ActivitiesListParams) => api.db.query<Activity[]>('activities.list', params),
      create: (data: CreateActivityData) => api.db.query<Activity>('activities.create', data),
    },
    userSettings: {
      get: (userId: string) => api.db.query<UserSettings | null>('userSettings.get', { userId }),
      upsert: (userId: string, data: Partial<UserSettings>) => api.db.query<UserSettings>('userSettings.upsert', { userId, ...data }),
    },
    agentSessions: {
      list: (params?: AgentSessionsListParams) => api.db.query<AgentSession[]>('agentSessions.list', params),
      get: (id: string) => api.db.query<AgentSession | null>('agentSessions.get', { id }),
      create: (data: CreateAgentSessionData) => api.db.query<AgentSession>('agentSessions.create', data),
      update: (id: string, data: Partial<AgentSession>) => api.db.query<AgentSession>('agentSessions.update', { id, ...data }),
    },
    agentLogs: {
      list: (sessionId: string) => api.db.query<AgentLog[]>('agentLogs.list', { sessionId }),
      create: (data: CreateAgentLogData) => api.db.query<AgentLog>('agentLogs.create', data),
    },
    chatSessions: {
      list: (params: ChatSessionsListParams) => api.db.query<ChatSession[]>('chatSessions.list', params),
      get: (id: string) => api.db.query<ChatSession | null>('chatSessions.get', { id }),
      create: (data: CreateChatSessionData) => api.db.query<ChatSession>('chatSessions.create', data),
      update: (id: string, data: Partial<ChatSession>) => api.db.query<ChatSession>('chatSessions.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('chatSessions.delete', { id }),
    },
    chatMessages: {
      list: (sessionId: string) => api.db.query<ChatMessage[]>('chatMessages.list', { sessionId }),
      create: (data: CreateChatMessageData) => api.db.query<ChatMessage>('chatMessages.create', data),
    },
    promptTemplates: {
      list: (params?: { category?: string }) => api.db.query<PromptTemplate[]>('promptTemplates.list', params),
      get: (id: string) => api.db.query<PromptTemplate | null>('promptTemplates.get', { id }),
      create: (data: CreatePromptTemplateData) => api.db.query<PromptTemplate>('promptTemplates.create', data),
      update: (id: string, data: Partial<PromptTemplate>) => api.db.query<PromptTemplate>('promptTemplates.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('promptTemplates.delete', { id }),
    },
    projectMemory: {
      list: (projectId: string, filter?: MemoryFilter) => api.db.query<ProjectMemory[]>('projectMemory.list', { projectId, ...filter }),
      get: (id: string) => api.db.query<ProjectMemory | null>('projectMemory.get', { id }),
      create: (data: CreateMemoryData) => api.db.query<ProjectMemory>('projectMemory.create', data),
      update: (id: string, data: Partial<ProjectMemory>) => api.db.query<ProjectMemory>('projectMemory.update', { id, ...data }),
      delete: (id: string) => api.db.query<void>('projectMemory.delete', { id }),
    },
    memoryUsage: {
      list: (memoryId: string) => api.db.query<MemoryUsage[]>('memoryUsage.list', { memoryId }),
      create: (data: RecordUsageData) => api.db.query<MemoryUsage>('memoryUsage.create', data),
      update: (id: string, data: Partial<MemoryUsage>) => api.db.query<MemoryUsage>('memoryUsage.update', { id, ...data }),
    },
  }
}

function createEventAdapter(): EventAdapter {
  const api = getAPI()
  return {
    on: (channel: string, callback: (...args: unknown[]) => void) => api.on(channel, callback),
    emit: () => { /* IPC is one-way from main */ },
  }
}

function createStreamAdapter(): StreamAdapter {
  const api = getAPI()
  const doneListeners = new Map<string, Set<(result: StreamResult) => void>>()
  const errorListeners = new Map<string, Set<(error: Error) => void>>()

  return {
    start: async (endpoint: string, data: unknown) => {
      const streamId = await api.stream.start(endpoint, data)
      return streamId
    },
    cancel: async (streamId: string) => {
      await api.stream.cancel(streamId)
    },
    onData: (streamId: string, callback: (event: StreamEvent) => void) => {
      const unsub = api.on('stream:data', (data: any) => {
        if (data.streamId === streamId) callback(data)
      })
      return unsub
    },
    onDone: (streamId: string, callback: (result: StreamResult) => void) => {
      const unsub = api.on('stream:done', (data: any) => {
        if (data.streamId === streamId) callback(data)
      })
      return unsub
    },
    onError: (streamId: string, callback: (error: Error) => void) => {
      const unsub = api.on('stream:error', (data: any) => {
        if (data.streamId === streamId) callback(new Error(data.error))
      })
      return unsub
    },
  }
}

function createFilesystemAdapter(): FilesystemAdapter {
  const api = getAPI()
  return {
    readFile: (p: string) => api.fs.readFile(p),
    writeFile: (p: string, c: string) => api.fs.writeFile(p, c),
    readDir: (p: string) => api.fs.readDir(p) as Promise<DirectoryEntry[]>,
    exists: (p: string) => api.fs.exists(p),
    mkdir: (p: string, r?: boolean) => api.fs.mkdir(p, r),
    remove: (p: string) => api.fs.remove(p),
    selectDirectory: () => api.fs.selectDirectory(),
  }
}

function createAuthAdapter(): AuthAdapter {
  return {
    getCurrentUser: async () => LOCAL_USER,
    isAuthenticated: async () => true,
  }
}

function createAgentAdapter(): AgentAdapter {
  const api = getAPI()
  return {
    spawn: (options: SpawnAgentOptions) => api.agent.spawn(options) as Promise<AgentSession>,
    pause: (sessionId: string) => api.agent.pause(sessionId),
    resume: (sessionId: string) => api.agent.resume(sessionId),
    cancel: (sessionId: string) => api.agent.cancel(sessionId),
    list: () => api.agent.list() as Promise<AgentSession[]>,
    get: (sessionId: string) => api.agent.get(sessionId) as Promise<AgentSession | null>,
  }
}

function createTerminalAdapter(): TerminalAdapter {
  const api = getAPI()
  return {
    spawn: (options: SpawnTerminalOptions) => api.terminal.spawn(options) as Promise<TerminalSession>,
    write: (sessionId: string, data: string) => api.terminal.write(sessionId, data),
    resize: (sessionId: string, cols: number, rows: number) => api.terminal.resize(sessionId, cols, rows),
    kill: (sessionId: string) => api.terminal.kill(sessionId),
    list: () => api.terminal.list() as Promise<TerminalSession[]>,
  }
}

function createMemoryAdapter(): MemoryAdapter {
  const api = getAPI()
  return {
    list: (projectId: string, filter?: MemoryFilter) => api.db.query<ProjectMemory[]>('projectMemory.list', { projectId, ...filter }),
    get: (id: string) => api.db.query<ProjectMemory | null>('projectMemory.get', { id }),
    create: (data: CreateMemoryData) => api.db.query<ProjectMemory>('projectMemory.create', data),
    update: (id: string, data: Partial<ProjectMemory>) => api.db.query<ProjectMemory>('projectMemory.update', { id, ...data }),
    deprecate: (id: string, reason: string) => api.db.query<ProjectMemory>('projectMemory.update', { id, status: 'deprecated', metadata: { deprecationReason: reason } }),
    enrichContext: async (projectId: string, storyId?: string) => {
      const memories = await api.db.query<ProjectMemory[]>('projectMemory.list', { projectId, status: 'active', limit: 20 })
      return {
        memories,
        memoryIds: memories.map((m: ProjectMemory) => m.id),
        totalCount: memories.length,
        categories: [...new Set(memories.map((m: ProjectMemory) => m.category))],
      }
    },
    recordUsage: (data: RecordUsageData) => api.db.query<MemoryUsage>('memoryUsage.create', data),
    getStats: async (projectId: string) => {
      const all = await api.db.query<ProjectMemory[]>('projectMemory.list', { projectId })
      const active = all.filter((m: ProjectMemory) => m.status === 'active')
      const byType: Record<string, number> = {}
      const byCategory: Record<string, number> = {}
      for (const m of all) {
        byType[m.type] = (byType[m.type] || 0) + 1
        byCategory[m.category] = (byCategory[m.category] || 0) + 1
      }
      return {
        totalMemories: all.length,
        activeMemories: active.length,
        byType,
        byCategory,
        avgConfidence: all.length ? all.reduce((s: number, m: ProjectMemory) => s + m.confidence, 0) / all.length : 0,
        avgSuccessRate: 0,
      }
    },
  }
}

function createGitAdapter(): GitAdapter {
  const api = getAPI()
  return {
    status: (workDir: string) => api.git.status(workDir) as Promise<GitStatus>,
    init: (workDir: string) => api.git.init(workDir),
    commit: (workDir: string, message: string) => api.git.commit(workDir, message),
    diff: (workDir: string, options?: { staged?: boolean }) => api.git.diff(workDir, options),
    log: (workDir: string, limit?: number) => api.git.log(workDir, limit) as Promise<GitLogEntry[]>,
    branch: (workDir: string) => api.git.branch(workDir) as Promise<GitBranchInfo>,
    checkout: (workDir: string, branch: string, create?: boolean) => api.git.checkout(workDir, branch, create),
    push: (workDir: string, remote?: string, branch?: string) => api.git.push(workDir, remote, branch),
    pull: (workDir: string, remote?: string, branch?: string) => api.git.pull(workDir, remote, branch),
    add: (workDir: string, files: string[]) => api.git.add(workDir, files),
  }
}

function createAIAdapter(): AIAdapter {
  const api = getAPI()
  return {
    chat: (params: AIChatParams) => api.ai.chat(params),
    stream: (params: AIChatParams) => api.ai.stream(params),
  }
}

function createGitHubAdapter(): GitHubAdapter {
  const api = getAPI()
  return {
    listRepos: () => api.github.repos() as Promise<any>,
    listBranches: (owner: string, repo: string) => api.github.branches(owner, repo),
    clone: (owner: string, repo: string, path: string, branch?: string) => api.github.clone(owner, repo, path, branch),
    getUser: () => api.github.user() as Promise<any>,
    authenticate: (token: string) => api.github.authenticate(token),
  }
}

export function createLocalTransport(mode: TransportMode = 'local'): Transport {
  return {
    getMode: () => mode,
    isConnected: () => true,
    db: createDatabaseAdapter(),
    events: createEventAdapter(),
    stream: createStreamAdapter(),
    fs: createFilesystemAdapter(),
    auth: createAuthAdapter(),
    agent: createAgentAdapter(),
    terminal: createTerminalAdapter(),
    memory: createMemoryAdapter(),
    git: createGitAdapter(),
    ai: createAIAdapter(),
    github: createGitHubAdapter(),
  }
}
