// AIDEN v2 - Local Transport (Electron IPC)

import type {
  Transport, TransportMode, DatabaseAdapter, EventAdapter, StreamAdapter,
  FilesystemAdapter, AuthAdapter, Project, CreateProjectData, Epic, CreateEpicData,
  Story, CreateStoryData, StoriesListParams, Spec, CreateSpecData, SpecsListParams,
  Activity, CreateActivityData, ActivitiesListParams, UserSettings, User, DirectoryEntry, StreamEvent,
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
  const listeners = new Map<string, Set<(event: StreamEvent) => void>>()

  return {
    start: async (endpoint: string, data: unknown) => {
      const streamId = await api.stream.start(endpoint, data)
      return streamId
    },
    cancel: async (streamId: string) => {
      await api.stream.cancel(streamId)
      listeners.delete(streamId)
    },
    onData: (streamId: string, callback: (event: StreamEvent) => void) => {
      if (!listeners.has(streamId)) listeners.set(streamId, new Set())
      listeners.get(streamId)!.add(callback)
      const unsub = api.on('stream:data', (data: any) => {
        if (data.streamId === streamId) callback(data)
      })
      return () => { unsub(); listeners.get(streamId)?.delete(callback) }
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

export function createLocalTransport(mode: TransportMode = 'local'): Transport {
  return {
    getMode: () => mode,
    isConnected: () => true,
    db: createDatabaseAdapter(),
    events: createEventAdapter(),
    stream: createStreamAdapter(),
    fs: createFilesystemAdapter(),
    auth: createAuthAdapter(),
  }
}
