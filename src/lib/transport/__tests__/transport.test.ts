// AIDEN v2 - Transport Tests

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Transport } from '../types'

// Mock transport for testing both local and remote interfaces
function createMockTransport(): Transport {
  return {
    getMode: () => 'local',
    isConnected: () => true,
    db: {
      query: vi.fn().mockResolvedValue(null),
      projects: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'p1', name: 'Test', slug: 'test', userId: 'u1', type: 'NEXTJS', status: 'PLANNING', sourceType: 'NEW', initialized: false, githubBranch: 'main', settings: '{}', createdAt: '', updatedAt: '' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      epics: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'e1' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      stories: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 's1' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      specs: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sp1' }),
        update: vi.fn().mockResolvedValue({}),
      },
      activities: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'a1' }),
      },
      userSettings: {
        get: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({ id: 'us1', userId: 'u1' }),
      },
      agentSessions: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'as1' }),
        update: vi.fn().mockResolvedValue({}),
      },
      agentLogs: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'al1' }),
      },
      chatSessions: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'cs1' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      chatMessages: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'cm1' }),
      },
      promptTemplates: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'pt1' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      projectMemory: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'pm1' }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      memoryUsage: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 'mu1' }),
        update: vi.fn().mockResolvedValue({}),
      },
    },
    events: {
      on: vi.fn().mockReturnValue(() => {}),
      emit: vi.fn(),
    },
    stream: {
      start: vi.fn().mockResolvedValue('stream-1'),
      cancel: vi.fn().mockResolvedValue(undefined),
      onData: vi.fn().mockReturnValue(() => {}),
      onDone: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
    },
    fs: {
      readFile: vi.fn().mockResolvedValue('content'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      readDir: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(true),
      mkdir: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      selectDirectory: vi.fn().mockResolvedValue(null),
    },
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', name: 'Test' }),
      isAuthenticated: vi.fn().mockResolvedValue(true),
    },
    agent: {
      spawn: vi.fn().mockResolvedValue({ id: 'agent-1', status: 'running' }),
      pause: vi.fn().mockResolvedValue(true),
      resume: vi.fn().mockResolvedValue(true),
      cancel: vi.fn().mockResolvedValue(true),
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(null),
    },
    terminal: {
      spawn: vi.fn().mockResolvedValue({ id: 'term-1', status: 'running' }),
      write: vi.fn().mockResolvedValue(true),
      resize: vi.fn().mockResolvedValue(true),
      kill: vi.fn().mockResolvedValue(true),
      list: vi.fn().mockResolvedValue([]),
    },
    memory: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'mem-1' }),
      update: vi.fn().mockResolvedValue({}),
      deprecate: vi.fn().mockResolvedValue({}),
      enrichContext: vi.fn().mockResolvedValue({ memories: [], memoryIds: [], totalCount: 0, categories: [] }),
      recordUsage: vi.fn().mockResolvedValue({ id: 'usage-1' }),
      getStats: vi.fn().mockResolvedValue({ totalMemories: 0, activeMemories: 0, byType: {}, byCategory: {}, avgConfidence: 0, avgSuccessRate: 0 }),
    },
    git: {
      status: vi.fn().mockResolvedValue({ isClean: true, current: 'main', tracking: null, ahead: 0, behind: 0, files: [] }),
      init: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue('abc123'),
      diff: vi.fn().mockResolvedValue(''),
      log: vi.fn().mockResolvedValue([]),
      branch: vi.fn().mockResolvedValue({ current: 'main', all: ['main'], branches: {} }),
      checkout: vi.fn().mockResolvedValue(undefined),
      push: vi.fn().mockResolvedValue(undefined),
      pull: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockResolvedValue(undefined),
    },
    ai: {
      chat: vi.fn().mockResolvedValue('Hello!'),
      stream: vi.fn().mockResolvedValue('stream-ai-1'),
    },
    github: {
      listRepos: vi.fn().mockResolvedValue([]),
      listBranches: vi.fn().mockResolvedValue(['main']),
      clone: vi.fn().mockResolvedValue(undefined),
      getUser: vi.fn().mockResolvedValue(null),
      authenticate: vi.fn().mockResolvedValue(true),
    },
  }
}

describe('Transport Interface', () => {
  let transport: Transport

  beforeEach(() => {
    transport = createMockTransport()
  })

  describe('Database Adapter', () => {
    it('should list projects', async () => {
      const projects = await transport.db.projects.list()
      expect(projects).toEqual([])
    })

    it('should create a project', async () => {
      const project = await transport.db.projects.create({
        userId: 'u1', name: 'Test', slug: 'test',
      })
      expect(project.id).toBe('p1')
    })

    it('should CRUD agent sessions', async () => {
      const sessions = await transport.db.agentSessions.list()
      expect(sessions).toEqual([])

      const created = await transport.db.agentSessions.create({ storyId: 's1' })
      expect(created.id).toBe('as1')
    })

    it('should CRUD chat sessions and messages', async () => {
      const session = await transport.db.chatSessions.create({
        userId: 'u1', projectId: 'p1',
      })
      expect(session.id).toBe('cs1')

      const msg = await transport.db.chatMessages.create({
        sessionId: 'cs1', role: 'user', content: 'hello',
      })
      expect(msg.id).toBe('cm1')
    })

    it('should CRUD project memory', async () => {
      const mem = await transport.db.projectMemory.create({
        projectId: 'p1', type: 'pattern', category: 'arch',
        title: 'Test', content: 'Test content',
      })
      expect(mem.id).toBe('pm1')
    })

    it('should CRUD prompt templates', async () => {
      const pt = await transport.db.promptTemplates.create({
        name: 'Test', category: 'general', content: 'Hello {{name}}',
      })
      expect(pt.id).toBe('pt1')
    })
  })

  describe('Agent Adapter', () => {
    it('should spawn an agent', async () => {
      const session = await transport.agent.spawn({
        storyId: 's1',
        systemPrompt: 'test',
        userPrompt: 'do something',
      })
      expect(session.id).toBe('agent-1')
    })

    it('should pause/resume/cancel', async () => {
      expect(await transport.agent.pause('agent-1')).toBe(true)
      expect(await transport.agent.resume('agent-1')).toBe(true)
      expect(await transport.agent.cancel('agent-1')).toBe(true)
    })
  })

  describe('Terminal Adapter', () => {
    it('should spawn a terminal', async () => {
      const session = await transport.terminal.spawn({ id: 'term-1' })
      expect(session.id).toBe('term-1')
    })

    it('should write and resize', async () => {
      expect(await transport.terminal.write('term-1', 'ls')).toBe(true)
      expect(await transport.terminal.resize('term-1', 120, 40)).toBe(true)
    })
  })

  describe('Git Adapter', () => {
    it('should get status', async () => {
      const status = await transport.git.status('/tmp/repo')
      expect(status.isClean).toBe(true)
      expect(status.current).toBe('main')
    })

    it('should get branch info', async () => {
      const branch = await transport.git.branch('/tmp/repo')
      expect(branch.current).toBe('main')
    })

    it('should commit', async () => {
      const hash = await transport.git.commit('/tmp/repo', 'test commit')
      expect(hash).toBe('abc123')
    })
  })

  describe('Memory Adapter', () => {
    it('should enrich context', async () => {
      const ctx = await transport.memory.enrichContext('p1')
      expect(ctx.memories).toEqual([])
      expect(ctx.totalCount).toBe(0)
    })

    it('should get stats', async () => {
      const stats = await transport.memory.getStats('p1')
      expect(stats.totalMemories).toBe(0)
    })
  })

  describe('Stream Adapter', () => {
    it('should start and subscribe', async () => {
      const streamId = await transport.stream.start('chat', { messages: [] })
      expect(streamId).toBe('stream-1')

      const unsub = transport.stream.onData(streamId, () => {})
      expect(typeof unsub).toBe('function')
    })
  })

  describe('AI Adapter', () => {
    it('should chat', async () => {
      const result = await transport.ai.chat({
        messages: [{ role: 'user', content: 'hello' }],
      })
      expect(result).toBe('Hello!')
    })

    it('should start a stream', async () => {
      const streamId = await transport.ai.stream({
        messages: [{ role: 'user', content: 'hello' }],
      })
      expect(streamId).toBe('stream-ai-1')
    })
  })

  describe('GitHub Adapter', () => {
    it('should list repos', async () => {
      const repos = await transport.github.listRepos()
      expect(repos).toEqual([])
    })

    it('should authenticate', async () => {
      const ok = await transport.github.authenticate('ghp_test')
      expect(ok).toBe(true)
    })
  })
})
