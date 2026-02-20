// AIDEN v2 Desktop - Database IPC Handlers (Complete)

import { ipcMain } from 'electron'
import { getDatabaseClient } from '../services/database'

type OperationHandler = (params: any) => Promise<unknown>

export function registerDatabaseHandlers(): void {
  ipcMain.handle('db:query', async (_event, { operation, params }: { operation: string; params?: unknown }) => {
    const db = getDatabaseClient()
    if (!db) throw new Error('Database not initialized')

    const handler = getOperationHandler(operation)
    if (!handler) throw new Error(`Unknown operation: ${operation}`)

    try {
      return await handler(params)
    } catch (error) {
      console.error(`[DB] ${operation} failed:`, error)
      throw error
    }
  })
}

function getOperationHandler(operation: string): OperationHandler | null {
  const db = getDatabaseClient()!

  const handlers: Record<string, OperationHandler> = {
    // Projects
    'projects.list': async (p) => db.project.findMany({
      where: p?.userId ? { userId: p.userId } : undefined,
      orderBy: { updatedAt: 'desc' },
      take: p?.limit || 50,
    }),
    'projects.get': async (p) => db.project.findUnique({
      where: { id: p.id },
      include: { epics: { include: { stories: true } }, specs: true },
    }),
    'projects.getBySlug': async (p) => db.project.findUnique({
      where: { userId_slug: { userId: p.userId, slug: p.slug } },
    }),
    'projects.create': async (p) => db.project.create({ data: p }),
    'projects.update': async (p) => {
      const { id, ...data } = p
      return db.project.update({ where: { id }, data })
    },
    'projects.delete': async (p) => db.project.delete({ where: { id: p.id } }),

    // Epics
    'epics.list': async (p) => db.epic.findMany({
      where: { projectId: p.projectId },
      orderBy: { number: 'asc' },
      include: { stories: { orderBy: { order: 'asc' } } },
    }),
    'epics.get': async (p) => db.epic.findUnique({
      where: { id: p.id },
      include: { stories: { orderBy: { order: 'asc' } } },
    }),
    'epics.create': async (p) => db.epic.create({ data: p }),
    'epics.update': async (p) => {
      const { id, ...data } = p
      return db.epic.update({ where: { id }, data })
    },
    'epics.delete': async (p) => db.epic.delete({ where: { id: p.id } }),

    // Stories
    'stories.list': async (p) => {
      const where: Record<string, unknown> = {}
      if (p?.epicId) where.epicId = p.epicId
      if (p?.projectId) where.epic = { projectId: p.projectId }
      if (p?.status) where.status = p.status
      return db.story.findMany({ where, orderBy: { order: 'asc' }, include: { epic: true, specs: true } })
    },
    'stories.get': async (p) => db.story.findUnique({
      where: { id: p.id },
      include: { epic: { include: { project: true } }, specs: true },
    }),
    'stories.create': async (p) => db.story.create({ data: p, include: { epic: true } }),
    'stories.update': async (p) => {
      const { id, ...data } = p
      return db.story.update({ where: { id }, data })
    },
    'stories.delete': async (p) => db.story.delete({ where: { id: p.id } }),

    // Specs
    'specs.list': async (p) => {
      const where: Record<string, unknown> = {}
      if (p?.projectId) where.projectId = p.projectId
      if (p?.storyId) where.storyId = p.storyId
      if (p?.epicId) where.epicId = p.epicId
      if (p?.type) where.type = p.type
      return db.spec.findMany({ where, orderBy: { createdAt: 'desc' } })
    },
    'specs.get': async (p) => db.spec.findUnique({ where: { id: p.id } }),
    'specs.create': async (p) => db.spec.create({ data: p }),
    'specs.update': async (p) => {
      const { id, ...data } = p
      return db.spec.update({ where: { id }, data })
    },

    // Agent Sessions
    'agentSessions.list': async (p) => {
      const where: Record<string, unknown> = {}
      if (p?.storyId) where.storyId = p.storyId
      if (p?.status) where.status = p.status
      return db.agentSession.findMany({ where, orderBy: { createdAt: 'desc' }, include: { logs: { take: 50 } } })
    },
    'agentSessions.get': async (p) => db.agentSession.findUnique({
      where: { id: p.id }, include: { logs: true },
    }),
    'agentSessions.create': async (p) => db.agentSession.create({ data: p }),
    'agentSessions.update': async (p) => {
      const { id, ...data } = p
      return db.agentSession.update({ where: { id }, data })
    },

    // Agent Logs
    'agentLogs.list': async (p) => db.agentLog.findMany({
      where: { sessionId: p.sessionId },
      orderBy: { timestamp: 'asc' },
    }),
    'agentLogs.create': async (p) => db.agentLog.create({ data: p }),

    // Chat Sessions
    'chatSessions.list': async (p) => {
      const where: Record<string, unknown> = {}
      if (p?.projectId) where.projectId = p.projectId
      if (p?.storyId) where.storyId = p.storyId
      if (p?.userId) where.userId = p.userId
      if (p?.type) where.type = p.type
      return db.chatSession.findMany({ where, orderBy: { updatedAt: 'desc' }, include: { messages: { take: 50, orderBy: { createdAt: 'desc' } } } })
    },
    'chatSessions.get': async (p) => db.chatSession.findUnique({
      where: { id: p.id }, include: { messages: { orderBy: { createdAt: 'asc' } } },
    }),
    'chatSessions.create': async (p) => db.chatSession.create({ data: p }),
    'chatSessions.update': async (p) => {
      const { id, ...data } = p
      return db.chatSession.update({ where: { id }, data })
    },
    'chatSessions.delete': async (p) => db.chatSession.delete({ where: { id: p.id } }),

    // Chat Messages
    'chatMessages.list': async (p) => db.chatMessage.findMany({
      where: { sessionId: p.sessionId }, orderBy: { createdAt: 'asc' },
    }),
    'chatMessages.create': async (p) => db.chatMessage.create({ data: p }),

    // User Settings
    'userSettings.get': async (p) => db.userSettings.findUnique({ where: { userId: p.userId } }),
    'userSettings.upsert': async (p) => {
      const { userId, ...data } = p
      return db.userSettings.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    },

    // Activities
    'activities.list': async (p) => {
      const where: Record<string, unknown> = {}
      if (p?.projectId) where.projectId = p.projectId
      if (p?.storyId) where.storyId = p.storyId
      return db.activity.findMany({ where, orderBy: { createdAt: 'desc' }, take: p?.limit || 50 })
    },
    'activities.create': async (p) => db.activity.create({ data: p }),

    // Memory - using generic query since Prisma model may not exist yet
    // These will work once the schema includes ProjectMemory and MemoryUsage models
    'projectMemory.list': async (p) => {
      try {
        const where: Record<string, unknown> = { projectId: p.projectId }
        if (p?.status) where.status = p.status
        if (p?.types) where.type = { in: p.types }
        if (p?.categories) where.category = { in: p.categories }
        return await (db as any).projectMemory.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: p?.limit || 100,
        })
      } catch { return [] }
    },
    'projectMemory.get': async (p) => {
      try { return await (db as any).projectMemory.findUnique({ where: { id: p.id } }) }
      catch { return null }
    },
    'projectMemory.create': async (p) => {
      return (db as any).projectMemory.create({ data: p })
    },
    'projectMemory.update': async (p) => {
      const { id, ...data } = p
      return (db as any).projectMemory.update({ where: { id }, data })
    },
    'projectMemory.delete': async (p) => {
      return (db as any).projectMemory.delete({ where: { id: p.id } })
    },

    'memoryUsage.list': async (p) => {
      try {
        return await (db as any).memoryUsage.findMany({
          where: { memoryId: p.memoryId },
          orderBy: { createdAt: 'desc' },
        })
      } catch { return [] }
    },
    'memoryUsage.create': async (p) => {
      return (db as any).memoryUsage.create({ data: p })
    },
    'memoryUsage.update': async (p) => {
      const { id, ...data } = p
      return (db as any).memoryUsage.update({ where: { id }, data })
    },

    // Prompt Templates (if model exists)
    'promptTemplates.list': async (p) => {
      try {
        const where: Record<string, unknown> = {}
        if (p?.category) where.category = p.category
        return await (db as any).promptTemplate.findMany({ where, orderBy: { name: 'asc' } })
      } catch { return [] }
    },
    'promptTemplates.get': async (p) => {
      try { return await (db as any).promptTemplate.findUnique({ where: { id: p.id } }) }
      catch { return null }
    },
    'promptTemplates.create': async (p) => (db as any).promptTemplate.create({ data: p }),
    'promptTemplates.update': async (p) => {
      const { id, ...data } = p
      return (db as any).promptTemplate.update({ where: { id }, data })
    },
    'promptTemplates.delete': async (p) => (db as any).promptTemplate.delete({ where: { id: p.id } }),
  }

  return handlers[operation] || null
}
