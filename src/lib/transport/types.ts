// AIDEN v2 - Transport Types (Full)

export type TransportMode = 'local' | 'remote' | 'hybrid'

export interface Transport {
  getMode(): TransportMode
  isConnected(): boolean
  db: DatabaseAdapter
  events: EventAdapter
  stream: StreamAdapter
  fs: FilesystemAdapter
  auth: AuthAdapter
  agent: AgentAdapter
  terminal: TerminalAdapter
  memory: MemoryAdapter
  git: GitAdapter
  ai: AIAdapter
  github: GitHubAdapter
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
  agentSessions: {
    list(params?: AgentSessionsListParams): Promise<AgentSession[]>
    get(id: string): Promise<AgentSession | null>
    create(data: CreateAgentSessionData): Promise<AgentSession>
    update(id: string, data: Partial<AgentSession>): Promise<AgentSession>
  }
  agentLogs: {
    list(sessionId: string): Promise<AgentLog[]>
    create(data: CreateAgentLogData): Promise<AgentLog>
  }
  chatSessions: {
    list(params: ChatSessionsListParams): Promise<ChatSession[]>
    get(id: string): Promise<ChatSession | null>
    create(data: CreateChatSessionData): Promise<ChatSession>
    update(id: string, data: Partial<ChatSession>): Promise<ChatSession>
    delete(id: string): Promise<void>
  }
  chatMessages: {
    list(sessionId: string): Promise<ChatMessage[]>
    create(data: CreateChatMessageData): Promise<ChatMessage>
  }
  promptTemplates: {
    list(params?: { category?: string }): Promise<PromptTemplate[]>
    get(id: string): Promise<PromptTemplate | null>
    create(data: CreatePromptTemplateData): Promise<PromptTemplate>
    update(id: string, data: Partial<PromptTemplate>): Promise<PromptTemplate>
    delete(id: string): Promise<void>
  }
  projectMemory: {
    list(projectId: string, filter?: MemoryFilter): Promise<ProjectMemory[]>
    get(id: string): Promise<ProjectMemory | null>
    create(data: CreateMemoryData): Promise<ProjectMemory>
    update(id: string, data: Partial<ProjectMemory>): Promise<ProjectMemory>
    delete(id: string): Promise<void>
  }
  memoryUsage: {
    list(memoryId: string): Promise<MemoryUsage[]>
    create(data: RecordUsageData): Promise<MemoryUsage>
    update(id: string, data: Partial<MemoryUsage>): Promise<MemoryUsage>
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
  onDone(streamId: string, callback: (result: StreamResult) => void): () => void
  onError(streamId: string, callback: (error: Error) => void): () => void
}

export interface StreamEvent {
  type: 'text' | 'thinking' | 'tool_use' | 'message'
  content?: string
  data?: unknown
}

export interface StreamResult {
  message?: { role: string; content: string }
  usage?: { input_tokens: number; output_tokens: number }
  cancelled?: boolean
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

// Agent
export interface AgentAdapter {
  spawn(options: SpawnAgentOptions): Promise<AgentSession>
  pause(sessionId: string): Promise<boolean>
  resume(sessionId: string): Promise<boolean>
  cancel(sessionId: string): Promise<boolean>
  list(): Promise<AgentSession[]>
  get(sessionId: string): Promise<AgentSession | null>
}

export interface SpawnAgentOptions {
  storyId: string
  systemPrompt: string
  userPrompt: string
  workspacePath?: string
  config?: {
    model?: string
    timeout?: number
    workingDirectory?: string
  }
}

// Terminal
export interface TerminalAdapter {
  spawn(options: SpawnTerminalOptions): Promise<TerminalSession>
  write(sessionId: string, data: string): Promise<boolean>
  resize(sessionId: string, cols: number, rows: number): Promise<boolean>
  kill(sessionId: string): Promise<boolean>
  list(): Promise<TerminalSession[]>
}

export interface SpawnTerminalOptions {
  id: string
  cwd?: string
  cols?: number
  rows?: number
}

export interface TerminalSession {
  id: string
  status: string
  pid?: number
  createdAt: string
}

// Memory
export interface MemoryAdapter {
  list(projectId: string, filter?: MemoryFilter): Promise<ProjectMemory[]>
  get(id: string): Promise<ProjectMemory | null>
  create(data: CreateMemoryData): Promise<ProjectMemory>
  update(id: string, data: Partial<ProjectMemory>): Promise<ProjectMemory>
  deprecate(id: string, reason: string): Promise<ProjectMemory>
  enrichContext(projectId: string, storyId?: string): Promise<EnrichedContext>
  recordUsage(data: RecordUsageData): Promise<MemoryUsage>
  getStats(projectId: string): Promise<MemoryStats>
}

export interface MemoryFilter {
  types?: string[]
  categories?: string[]
  status?: string[]
  minConfidence?: number
  limit?: number
}

export interface CreateMemoryData {
  projectId: string
  type: string
  category: string
  title: string
  content: string
  metadata?: Record<string, unknown>
  sourceAgentId?: string
  sourceStoryId?: string
  confidence?: number
}

export interface RecordUsageData {
  memoryId: string
  agentSessionId: string
  storyId?: string
  wasHelpful?: boolean
  outcome?: string
}

export interface ProjectMemory {
  id: string
  projectId: string
  type: string
  category: string
  title: string
  content: string
  metadata: Record<string, unknown>
  sourceAgentId?: string | null
  sourceStoryId?: string | null
  confidence: number
  useCount: number
  successRate?: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface MemoryUsage {
  id: string
  memoryId: string
  agentSessionId: string
  storyId?: string | null
  wasHelpful?: boolean | null
  outcome: string
  createdAt: string
}

export interface EnrichedContext {
  memories: ProjectMemory[]
  memoryIds: string[]
  totalCount: number
  categories: string[]
}

export interface MemoryStats {
  totalMemories: number
  activeMemories: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  avgConfidence: number
  avgSuccessRate: number
}

// Git
export interface GitAdapter {
  status(workDir: string): Promise<GitStatus>
  init(workDir: string): Promise<void>
  commit(workDir: string, message: string): Promise<string>
  diff(workDir: string, options?: { staged?: boolean }): Promise<string>
  log(workDir: string, limit?: number): Promise<GitLogEntry[]>
  branch(workDir: string): Promise<GitBranchInfo>
  checkout(workDir: string, branch: string, create?: boolean): Promise<void>
  push(workDir: string, remote?: string, branch?: string): Promise<void>
  pull(workDir: string, remote?: string, branch?: string): Promise<void>
  add(workDir: string, files: string[]): Promise<void>
}

export interface GitStatus {
  isClean: boolean
  current: string | null
  tracking: string | null
  ahead: number
  behind: number
  files: GitFileStatus[]
}

export interface GitFileStatus {
  path: string
  index: string
  working_dir: string
}

export interface GitLogEntry {
  hash: string
  date: string
  message: string
  author_name: string
  author_email: string
}

export interface GitBranchInfo {
  current: string
  all: string[]
  branches: Record<string, { current: boolean; name: string; commit: string }>
}

// AI
export interface AIAdapter {
  chat(params: AIChatParams): Promise<string>
  stream(params: AIChatParams): Promise<string> // returns streamId
}

export interface AIChatParams {
  messages: Array<{ role: string; content: string }>
  model?: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  projectId?: string
  sessionId?: string
}

// GitHub
export interface GitHubAdapter {
  listRepos(): Promise<GitHubRepo[]>
  listBranches(owner: string, repo: string): Promise<string[]>
  clone(owner: string, repo: string, path: string, branch?: string): Promise<void>
  getUser(): Promise<GitHubUser | null>
  authenticate(token: string): Promise<boolean>
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  default_branch: string
  updated_at: string
}

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
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
  githubAccessToken?: string
  githubUsername?: string
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
  logs?: AgentLog[]
}

export interface CreateAgentSessionData {
  storyId: string
  workspacePath?: string
}

export interface AgentSessionsListParams {
  storyId?: string
  status?: string
}

export interface AgentLog {
  id: string
  sessionId: string
  level: string
  message: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface CreateAgentLogData {
  sessionId: string
  level: string
  message: string
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  projectId?: string
  storyId?: string
  userId: string
  type: string
  phase: string
  context: Record<string, unknown> | string
  isActive: boolean
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export interface CreateChatSessionData {
  userId: string
  projectId?: string
  storyId?: string
  type?: string
  phase?: string
}

export interface ChatSessionsListParams {
  projectId?: string
  storyId?: string
  userId?: string
  type?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: string
  content: string
  phase?: string
  metadata?: Record<string, unknown> | string
  createdAt: string
}

export interface CreateChatMessageData {
  sessionId: string
  role: string
  content: string
  phase?: string
  metadata?: Record<string, unknown>
}

export interface PromptTemplate {
  id: string
  name: string
  description?: string
  category: string
  content: string
  variables: string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePromptTemplateData {
  name: string
  description?: string
  category: string
  content: string
  variables?: string[]
  isSystem?: boolean
}
