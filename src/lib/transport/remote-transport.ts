// AIDEN v2 - Remote Transport (HTTP to NestJS server)

import type {
  Transport, TransportMode, DatabaseAdapter, EventAdapter, StreamAdapter,
  FilesystemAdapter, AuthAdapter, Project, CreateProjectData, Epic, CreateEpicData,
  Story, CreateStoryData, StoriesListParams, Spec, CreateSpecData, SpecsListParams,
  Activity, CreateActivityData, ActivitiesListParams, UserSettings, User, DirectoryEntry, StreamEvent,
} from './types'

let baseUrl = ''
let authToken = ''

function getBaseUrl(): string {
  if (baseUrl) return baseUrl
  // Check Electron config or fallback
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'http://localhost:3000'
  }
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
      list: (params) => {
        const qs = new URLSearchParams()
        if (params.epicId) qs.set('epicId', params.epicId)
        if (params.status) qs.set('status', params.status)
        return fetchJson<Story[]>(`/api/stories?${qs}`)
      },
      get: (id) => fetchJson<Story | null>(`/api/stories/${id}`),
      create: (data) => fetchJson<Story>('/api/stories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Story>(`/api/stories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => fetchJson<void>(`/api/stories/${id}`, { method: 'DELETE' }),
    },
    specs: {
      list: (params) => {
        const qs = new URLSearchParams()
        if (params.projectId) qs.set('projectId', params.projectId)
        if (params.storyId) qs.set('storyId', params.storyId)
        return fetchJson<Spec[]>(`/api/specs?${qs}`)
      },
      get: (id) => fetchJson<Spec | null>(`/api/specs/${id}`),
      create: (data) => fetchJson<Spec>('/api/specs', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => fetchJson<Spec>(`/api/specs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    activities: {
      list: (params) => fetchJson<Activity[]>(`/api/activities?projectId=${params.projectId || ''}`),
      create: (data) => fetchJson<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),
    },
    userSettings: {
      get: (userId) => fetchJson<UserSettings | null>(`/api/users/${userId}/settings`),
      upsert: (userId, data) => fetchJson<UserSettings>(`/api/users/${userId}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
    },
  }
}

function createEventAdapter(): EventAdapter {
  // Would use Socket.IO for real-time events in remote mode
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
  return {
    start: async (endpoint, data) => {
      const res = await fetchJson<{ streamId: string }>(`/api/stream/${endpoint}`, { method: 'POST', body: JSON.stringify(data) })
      return res.streamId
    },
    cancel: async (streamId) => {
      await fetchJson(`/api/stream/${streamId}/cancel`, { method: 'POST' })
    },
    onData: () => () => {},
  }
}

function createFilesystemAdapter(): FilesystemAdapter {
  // In remote mode, filesystem is accessed via the server API
  return {
    readFile: (p) => fetchJson<string>(`/api/fs/read?path=${encodeURIComponent(p)}`),
    writeFile: (p, c) => fetchJson<void>('/api/fs/write', { method: 'POST', body: JSON.stringify({ path: p, content: c }) }),
    readDir: (p) => fetchJson<DirectoryEntry[]>(`/api/fs/readdir?path=${encodeURIComponent(p)}`),
    exists: (p) => fetchJson<boolean>(`/api/fs/exists?path=${encodeURIComponent(p)}`),
    mkdir: (p) => fetchJson<void>('/api/fs/mkdir', { method: 'POST', body: JSON.stringify({ path: p }) }),
    remove: (p) => fetchJson<void>('/api/fs/remove', { method: 'POST', body: JSON.stringify({ path: p }) }),
    selectDirectory: async () => null, // Not supported in remote mode
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
  }
}
