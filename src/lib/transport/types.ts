// AIDEN v2 - Transport Types

export type TransportMode = 'local' | 'remote' | 'hybrid'

export interface Transport {
  getMode(): TransportMode
  isConnected(): boolean
  db: DatabaseAdapter
  events: EventAdapter
  stream: StreamAdapter
  fs: FilesystemAdapter
  auth: AuthAdapter
}

// Database
export interface DatabaseAdapter {
  query<T>(operation: string, params?: unknown): Promise<T>
  projects: CrudAdapter<Project, CreateProjectData>
  epics: CrudAdapter<Epic, CreateEpicData> & { list(projectId: string): Promise<Epic[]> }
  stories: {
    list(params: StoriesListParams): Promise<Story[]>
    get(id: string): Promise<Story | null>
    create(data: CreateStoryData): Promise<Story>
    update(id: string, data: Partial<Story>): Promise<Story>
    delete(id: string): Promise<void>
  }
  specs: {
    list(params: SpecsListParams): Promise<Spec[]>
    get(id: string): Promise<Spec | null>
    create(data: CreateSpecData): Promise<Spec>
    update(id: string, data: Partial<Spec>): Promise<Spec>
  }
  activities: {
    list(params: ActivitiesListParams): Promise<Activity[]>
    create(data: CreateActivityData): Promise<Activity>
  }
  userSettings: {
    get(userId: string): Promise<UserSettings | null>
    upsert(userId: string, data: Partial<UserSettings>): Promise<UserSettings>
  }
}

export interface CrudAdapter<T, C> {
  list(...args: unknown[]): Promise<T[]>
  get(id: string): Promise<T | null>
  create(data: C): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

// Events
export interface EventAdapter {
  on(channel: string, callback: (...args: unknown[]) => void): () => void
  emit(channel: string, ...args: unknown[]): void
}

// Stream
export interface StreamAdapter {
  start(endpoint: string, data: unknown): Promise<string>
  cancel(streamId: string): Promise<void>
  onData(streamId: string, callback: (event: StreamEvent) => void): () => void
}

export interface StreamEvent {
  type: 'text' | 'thinking' | 'tool_use' | 'message'
  content?: string
  data?: unknown
}

// Filesystem
export interface FilesystemAdapter {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  readDir(path: string): Promise<DirectoryEntry[]>
  exists(path: string): Promise<boolean>
  mkdir(path: string, recursive?: boolean): Promise<void>
  remove(path: string): Promise<void>
  selectDirectory(): Promise<string | null>
}

export interface DirectoryEntry {
  name: string
  path: string
  isDirectory: boolean
  size?: number
}

// Auth
export interface AuthAdapter {
  getCurrentUser(): Promise<User | null>
  isAuthenticated(): Promise<boolean>
}

// Data types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
}

export interface Project {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  type: string
  status: string
  sourceType: string
  initialized: boolean
  githubRepo?: string
  githubOwner?: string
  githubBranch: string
  outputDirectory?: string
  initialPrompt?: string
  settings: Record<string, unknown> | string
  createdAt: string
  updatedAt: string
  epics?: Epic[]
  specs?: Spec[]
}

export interface CreateProjectData {
  userId: string
  name: string
  slug: string
  description?: string
  type?: string
  sourceType?: string
  outputDirectory?: string
  initialPrompt?: string
}

export interface Epic {
  id: string
  projectId: string
  number: number
  title: string
  description?: string
  status: string
  order: number
  createdAt: string
  updatedAt: string
  stories?: Story[]
}

export interface CreateEpicData {
  projectId: string
  number: number
  title: string
  description?: string
  order?: number
}

export interface Story {
  id: string
  epicId: string
  number: number
  title: string
  description?: string
  status: string
  complexity: string
  order: number
  specification: Record<string, unknown> | string
  branch?: string
  baseBranch?: string
  useWorktree: boolean
  commitCount: number
  gitStatus: Record<string, unknown> | string
  createdAt: string
  updatedAt: string
  epic?: Epic
  specs?: Spec[]
}

export interface CreateStoryData {
  epicId: string
  number: number
  title: string
  description?: string
  complexity?: string
  order?: number
}

export interface StoriesListParams {
  epicId?: string
  projectId?: string
  status?: string
}

export interface Spec {
  id: string
  projectId: string
  storyId?: string
  epicId?: string
  type: string
  title: string
  content: string
  version: number
  filePath?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSpecData {
  projectId: string
  type: string
  title: string
  content: string
  storyId?: string
  epicId?: string
}

export interface SpecsListParams {
  projectId?: string
  storyId?: string
  epicId?: string
  type?: string
}

export interface Activity {
  id: string
  type: string
  message: string
  metadata?: Record<string, unknown> | string
  projectId?: string
  storyId?: string
  createdAt: string
}

export interface CreateActivityData {
  type: string
  message: string
  projectId?: string
  storyId?: string
  metadata?: Record<string, unknown>
}

export interface ActivitiesListParams {
  projectId?: string
  storyId?: string
  limit?: number
}

export interface UserSettings {
  id: string
  userId: string
  selectedAiProvider?: string
  claudeApiKey?: string
  openaiApiKey?: string
  autoStartRalph: boolean
  autoGeneratePrd: boolean
  createdAt: string
  updatedAt: string
}

export interface AgentSession {
  id: string
  storyId: string
  status: string
  progress: number
  workspacePath?: string
  tokenUsage: number
  error?: string
  createdAt: string
  updatedAt: string
}
