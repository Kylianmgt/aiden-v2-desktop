// AIDEN v2 - Remote Transport (HTTP to NestJS server) — Full Implementation

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

let baseUrl = ''
let authToken = ''

function getBaseUrl(): string {
  if (baseUrl) return baseUrl
  if (typeof window !== 'undefined' && window.electronAPI) return 'http://localhost:3000'
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  return headers
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const response = await fetch(url, { ...options, headers: { ...getHeaders(), ...options.headers as Record<string, string> } })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }
  return response.json()
}

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) { if (v) p.set(k, v) }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function createDatabaseAdapter(): DatabaseAdapter {
  return {
    query: async <T>(operation: string, params?: unknown) => {
      return fetchJson<T>('/api/query', { method: 'POST', body: JSON.stringify({ operation, params }) })
    },
    projects: {
      list: () => fetchJson<Project[]>('/api/projects'),
      get: (id) => fetchJson<Project | null>(`/api/projects/${id}`),
      create: (data) => fetchJson<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Project>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/projects/${id}`, { method: 'DELETE' }),
    },
    epics: {
      list: (projectId) => fetchJson<Epic[]>(`/api/projects/${projectId}/epics`),
      get: (id) => fetchJson<Epic | null>(`/api/epics/${id}`),
      create: (data) => fetchJson<Epic>('/api/epics', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Epic>(`/api/epics/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/epics/${id}`, { method: 'DELETE' }),
    },
    stories: {
      list: (params) => fetchJson<Story[]>(`/api/stories${qs({ epicId: params.epicId, status: params.status })}`),
      get: (id) => fetchJson<Story | null>(`/api/stories/${id}`),
      create: (data) => fetchJson<Story>('/api/stories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Story>(`/api/stories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/stories/${id}`, { method: 'DELETE' }),
    },
    specs: {
      list: (params) => fetchJson<Spec[]>(`/api/specs${qs({ projectId: params.projectId, storyId: params.storyId })}`),
      get: (id) => fetchJson<Spec | null>(`/api/specs/${id}`),
      create: (data) => fetchJson<Spec>('/api/specs', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Spec>(`/api/specs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    activities: {
      list: (params) => fetchJson<Activity[]>(`/api/activities${qs({ projectId: params.projectId, storyId: params.storyId })}`),
      create: (data) => fetchJson<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),
    },
    userSettings: {
      get: (userId) => fetchJson<UserSettings | null>(`/api/users/${userId}/settings`),
      upsert: (userId, data) => fetchJson<UserSettings>(`/api/users/${userId}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    agentSessions: {
      list: (params) => fetchJson<AgentSession[]>(`/api/agents${qs({ storyId: params?.storyId, status: params?.status })}`),
      get: (id) => fetchJson<AgentSession | null>(`/api/agents/${id}`),
      create: (data) => fetchJson<AgentSession>('/api/agents', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<AgentSession>(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    agentLogs: {
      list: (sessionId) => fetchJson<AgentLog[]>(`/api/agents/${sessionId}/logs`),
      create: (data) => fetchJson<AgentLog>(`/api/agents/${data.sessionId}/logs`, { method: 'POST', body: JSON.stringify(data) }),
    },
    chatSessions: {
      list: (params) => fetchJson<ChatSession[]>(`/api/chat/sessions${qs({ projectId: params.projectId, storyId: params.storyId, userId: params.userId })}`),
      get: (id) => fetchJson<ChatSession | null>(`/api/chat/sessions/${id}`),
      create: (data) => fetchJson<ChatSession>('/api/chat/sessions', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<ChatSession>(`/api/chat/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/chat/sessions/${id}`, { method: 'DELETE' }),
    },
    chatMessages: {
      list: (sessionId) => fetchJson<ChatMessage[]>(`/api/chat/sessions/${sessionId}/messages`),
      create: (data) => fetchJson<ChatMessage>(`/api/chat/sessions/${data.sessionId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
    },
    promptTemplates: {
      list: (params) => fetchJson<PromptTemplate[]>(`/api/prompt-templates${qs({ category: params?.category })}`),
      get: (id) => fetchJson<PromptTemplate | null>(`/api/prompt-templates/${id}`),
      create: (data) => fetchJson<PromptTemplate>('/api/prompt-templates', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<PromptTemplate>(`/api/prompt-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/prompt-templates/${id}`, { method: 'DELETE' }),
    },
    projectMemory: {
      list: (projectId, filter) => fetchJson<ProjectMemory[]>(`/api/projects/${projectId}/memory${qs({ ...(filter || {}) as any })}`),
      get: (id) => fetchJson<ProjectMemory | null>(`/api/memory/${id}`),
      create: (data) => fetchJson<ProjectMemory>(`/api/projects/${data.projectId}/memory`, { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<ProjectMemory>(`/api/memory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/memory/${id}`, { method: 'DELETE' }),
    },
    memoryUsage: {
      list: (memoryId) => fetchJson<MemoryUsage[]>(`/api/memory/${memoryId}/usage`),
      create: (data) => fetchJson<MemoryUsage>(`/api/memory/${data.memoryId}/usage`, { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<MemoryUsage>(`/api/memory/usage/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
  }
}

function createEventAdapter(): EventAdapter {
  const localListeners = new Map<string, Set<(...args: unknown[]) => void>>()
  return {
    on: (channel, callback) => {
      if (!localListeners.has(channel)) localListeners.set(channel, new Set())
      localListeners.get(channel)!.add(callback)
      return () => { localListeners.get(channel)?.delete(callback) }
    },
    emit: (channel, ...args) => {
      localListeners.get(channel)?.forEach((cb) => cb(...args))
    },
  }
}

function createStreamAdapter(): StreamAdapter {
  const dataListeners = new Map<string, Set<(event: StreamEvent) => void>>()
  const doneListeners = new Map<string, Set<(result: StreamResult) => void>>()
  const errorListeners = new Map<string, Set<(error: Error) => void>>()

  return {
    start: async (endpoint, data) => {
      const res = await fetch(`${getBaseUrl()}/api/stream/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error(`Stream start failed: ${res.status}`)

      const streamId = crypto.randomUUID()

      // Read SSE
      const reader = res.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        ;(async () => {
          let buffer = ''
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const d = line.slice(6)
                if (d === '[DONE]') continue
                try {
                  const event = JSON.parse(d)
                  dataListeners.get(streamId)?.forEach(cb => cb(event))
                } catch { /* skip */ }
              }
            }
          } catch (err: any) {
            errorListeners.get(streamId)?.forEach(cb => cb(err))
          }
          doneListeners.get(streamId)?.forEach(cb => cb({}))
        })()
      }

      return streamId
    },
    cancel: async (streamId) => {
      try { await fetchJson(`/api/stream/${streamId}/cancel`, { method: 'POST' }) } catch { /* ignore */ }
    },
    onData: (streamId, callback) => {
      if (!dataListeners.has(streamId)) dataListeners.set(streamId, new Set())
      dataListeners.get(streamId)!.add(callback)
      return () => { dataListeners.get(streamId)?.delete(callback) }
    },
    onDone: (streamId, callback) => {
      if (!doneListeners.has(streamId)) doneListeners.set(streamId, new Set())
      doneListeners.get(streamId)!.add(callback)
      return () => { doneListeners.get(streamId)?.delete(callback) }
    },
    onError: (streamId, callback) => {
      if (!errorListeners.has(streamId)) errorListeners.set(streamId, new Set())
      errorListeners.get(streamId)!.add(callback)
      return () => { errorListeners.get(streamId)?.delete(callback) }
    },
  }
}

function createFilesystemAdapter(): FilesystemAdapter {
  return {
    readFile: (p) => fetchJson<string>(`/api/fs/read?path=${encodeURIComponent(p)}`),
    writeFile: (p, c) => fetchJson<void>('/api/fs/write', { method: 'POST', body: JSON.stringify({ path: p, content: c }) }),
    readDir: (p) => fetchJson<DirectoryEntry[]>(`/api/fs/readdir?path=${encodeURIComponent(p)}`),
    exists: (p) => fetchJson<boolean>(`/api/fs/exists?path=${encodeURIComponent(p)}`),
    mkdir: (p) => fetchJson<void>('/api/fs/mkdir', { method: 'POST', body: JSON.stringify({ path: p }) }),
    remove: (p) => fetchJson<void>('/api/fs/remove', { method: 'POST', body: JSON.stringify({ path: p }) }),
    selectDirectory: async () => null,
  }
}

function createAuthAdapter(): AuthAdapter {
  return {
    getCurrentUser: async () => fetchJson<User>('/api/auth/me'),
    isAuthenticated: async () => {
      try { await fetchJson('/api/auth/me'); return true } catch { return false }
    },
  }
}

function createAgentAdapter(): AgentAdapter {
  return {
    spawn: (options) => fetchJson<AgentSession>('/api/agents/spawn', { method: 'POST', body: JSON.stringify(options) }),
    pause: (id) => fetchJson<boolean>(`/api/agents/${id}/pause`, { method: 'POST' }),
    resume: (id) => fetchJson<boolean>(`/api/agents/${id}/resume`, { method: 'POST' }),
    cancel: (id) => fetchJson<boolean>(`/api/agents/${id}/cancel`, { method: 'POST' }),
    list: () => fetchJson<AgentSession[]>('/api/agents'),
    get: (id) => fetchJson<AgentSession | null>(`/api/agents/${id}`),
  }
}

function createTerminalAdapter(): TerminalAdapter {
  // Terminal is local-only; in remote mode, operations are not supported
  return {
    spawn: async () => { throw new Error('Terminal spawning not supported in remote mode') },
    write: async () => false,
    resize: async () => false,
    kill: async () => false,
    list: async () => [],
  }
}

function createMemoryAdapter(): MemoryAdapter {
  return {
    list: (projectId, filter) => fetchJson<ProjectMemory[]>(`/api/projects/${projectId}/memory${qs({ ...(filter || {}) as any })}`),
    get: (id) => fetchJson<ProjectMemory | null>(`/api/memory/${id}`),
    create: (data) => fetchJson<ProjectMemory>(`/api/projects/${data.projectId}/memory`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchJson<ProjectMemory>(`/api/memory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deprecate: (id, reason) => fetchJson<ProjectMemory>(`/api/memory/${id}/deprecate`, { method: 'POST', body: JSON.stringify({ reason }) }),
    enrichContext: (projectId, storyId) => fetchJson<EnrichedContext>(`/api/projects/${projectId}/memory/enrich${qs({ storyId })}`),
    recordUsage: (data) => fetchJson<MemoryUsage>(`/api/memory/${data.memoryId}/usage`, { method: 'POST', body: JSON.stringify(data) }),
    getStats: (projectId) => fetchJson<MemoryStats>(`/api/projects/${projectId}/memory/stats`),
  }
}

function createGitAdapter(): GitAdapter {
  return {
    status: (w) => fetchJson<GitStatus>('/api/git/status', { method: 'POST', body: JSON.stringify({ workDir: w }) }),
    init: (w) => fetchJson<void>('/api/git/init', { method: 'POST', body: JSON.stringify({ workDir: w }) }),
    commit: (w, m) => fetchJson<string>('/api/git/commit', { method: 'POST', body: JSON.stringify({ workDir: w, message: m }) }),
    diff: (w, o) => fetchJson<string>('/api/git/diff', { method: 'POST', body: JSON.stringify({ workDir: w, ...o }) }),
    log: (w, l) => fetchJson<GitLogEntry[]>('/api/git/log', { method: 'POST', body: JSON.stringify({ workDir: w, limit: l }) }),
    branch: (w) => fetchJson<GitBranchInfo>('/api/git/branch', { method: 'POST', body: JSON.stringify({ workDir: w }) }),
    checkout: (w, b, c) => fetchJson<void>('/api/git/checkout', { method: 'POST', body: JSON.stringify({ workDir: w, branch: b, create: c }) }),
    push: (w, r, b) => fetchJson<void>('/api/git/push', { method: 'POST', body: JSON.stringify({ workDir: w, remote: r, branch: b }) }),
    pull: (w, r, b) => fetchJson<void>('/api/git/pull', { method: 'POST', body: JSON.stringify({ workDir: w, remote: r, branch: b }) }),
    add: (w, f) => fetchJson<void>('/api/git/add', { method: 'POST', body: JSON.stringify({ workDir: w, files: f }) }),
  }
}

function createAIAdapter(): AIAdapter {
  return {
    chat: (params) => fetchJson<string>('/api/ai/chat', { method: 'POST', body: JSON.stringify(params) }),
    stream: async (params) => {
      const res = await fetchJson<{ streamId: string }>('/api/ai/stream', { method: 'POST', body: JSON.stringify(params) })
      return res.streamId
    },
  }
}

function createGitHubAdapter(): GitHubAdapter {
  return {
    listRepos: () => fetchJson<GitHubRepo[]>('/api/github/repos'),
    listBranches: (owner, repo) => fetchJson<string[]>(`/api/github/repos/${owner}/${repo}/branches`),
    clone: (owner, repo, path, branch) => fetchJson<void>('/api/github/clone', { method: 'POST', body: JSON.stringify({ owner, repo, path, branch }) }),
    getUser: () => fetchJson<GitHubUser>('/api/github/user'),
    authenticate: (token) => fetchJson<boolean>('/api/github/authenticate', { method: 'POST', body: JSON.stringify({ token }) }),
  }
}

export function createRemoteTransport(url?: string, token?: string): Transport {
  if (url) baseUrl = url
  if (token) authToken = token

  return {
    getMode: () => 'remote' as TransportMode,
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
