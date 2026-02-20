// AIDEN v2 Desktop - Database IPC Handlers

import { ipcMain } from 'electron'
import { getDatabaseClient } from '../services/database'

interface QueryParams {
  operation: string
  params?: unknown
}

type OperationHandler = (params: unknown) => Promise<unknown>

export function registerDatabaseHandlers(): void {
  ipcMain.handle('db:query', async (_event, { operation, params }: QueryParams) => {
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
    'projects.list': async (p: any) => db.project.findMany({
      where: { userId: p.userId },
      orderBy: { updatedAt: 'desc' },
      take: p.limit || 50,
    }),
    'projects.get': async (p: any) => db.project.findUnique({
      where: { id: p.id },
      include: { epics: { include: { stories: true } }, specs: true },
    }),
    'projects.getBySlug': async (p: any) => db.project.findUnique({
      where: { userId_slug: { userId: p.userId, slug: p.slug } },
    }),
    'projects.create': async (p: any) => db.project.create({ data: p }),
    'projects.update': async (p: any) => {
      const { id, ...data } = p
      return db.project.update({ where: { id }, data })
    },
    'projects.delete': async (p: any) => db.project.delete({ where: { id: p.id } }),

    // Epics
    'epics.list': async (p: any) => db.epic.findMany({
      where: { projectId: p.projectId },
      orderBy: { number: 'asc' },
      include: { stories: { orderBy: { order: 'asc' } } },
    }),
    'epics.get': async (p: any) => db.epic.findUnique({
      where: { id: p.id },
      include: { stories: { orderBy: { order: 'asc' } } },
    }),
    'epics.create': async (p: any) => db.epic.create({ data: p }),
    'epics.update': async (p: any) => {
      const { id, ...data } = p
      return db.epic.update({ where: { id }, data })
    },
    'epics.delete': async (p: any) => db.epic.delete({ where: { id: p.id } }),

    // Stories
    'stories.list': async (p: any) => {
      const where: Record<string, unknown> = {}
      if (p.epicId) where.epicId = p.epicId
      if (p.status) where.status = p.status
      return db.story.findMany({
        where,
        orderBy: { order: 'asc' },
        include: { epic: true, specs: true },
      })
    },
    'stories.get': async (p: any) => db.story.findUnique({
      where: { id: p.id },
      include: { epic: { include: { project: true } }, specs: true },
    }),
    'stories.create': async (p: any) => db.story.create({ data: p, include: { epic: true } }),
    'stories.update': async (p: any) => {
      const { id, ...data } = p
      return db.story.update({ where: { id }, data })
    },
    'stories.delete': async (p: any) => db.story.delete({ where: { id: p.id } }),

    // Specs
    'specs.list': async (p: any) => {
      const where: Record<string, unknown> = {}
      if (p.projectId) where.projectId = p.projectId
      if (p.storyId) where.storyId = p.storyId
      if (p.type) where.type = p.type
      return db.spec.findMany({ where, orderBy: { createdAt: 'desc' } })
    },
    'specs.get': async (p: any) => db.spec.findUnique({ where: { id: p.id } }),
    'specs.create': async (p: any) => db.spec.create({ data: p }),
    'specs.update': async (p: any) => {
      const { id, ...data } = p
      return db.spec.update({ where: { id }, data })
    },

    // Agent Sessions
    'agentSessions.list': async (p: any) => {
      const where: Record<string, unknown> = {}
      if (p?.storyId) where.storyId = p.storyId
      if (p?.status) where.status = p.status
      return db.agentSession.findMany({ where, orderBy: { createdAt: 'desc' }, include: { logs: { take: 50 } } })
    },
    'agentSessions.get': async (p: any) => db.agentSession.findUnique({
      where: { id: p.id }, include: { logs: true },
    }),
    'agentSessions.create': async (p: any) => db.agentSession.create({ data: p }),
    'agentSessions.update': async (p: any) => {
      const { id, ...data } = p
      return db.agentSession.update({ where: { id }, data })
    },

    // Chat Sessions
    'chatSessions.list': async (p: any) => {
      const where: Record<string, unknown> = {}
      if (p.projectId) where.projectId = p.projectId
      if (p.userId) where.userId = p.userId
      return db.chatSession.findMany({ where, orderBy: { updatedAt: 'desc' }, include: { messages: true } })
    },
    'chatSessions.get': async (p: any) => db.chatSession.findUnique({
      where: { id: p.id }, include: { messages: { orderBy: { createdAt: 'asc' } } },
    }),
    'chatSessions.create': async (p: any) => db.chatSession.create({ data: p }),
    'chatSessions.update': async (p: any) => {
      const { id, ...data } = p
      return db.chatSession.update({ where: { id }, data })
    },

    // Chat Messages
    'chatMessages.create': async (p: any) => db.chatMessage.create({ data: p }),
    'chatMessages.list': async (p: any) => db.chatMessage.findMany({
      where: { sessionId: p.sessionId }, orderBy: { createdAt: 'asc' },
    }),

    // User Settings
    'userSettings.get': async (p: any) => db.userSettings.findUnique({ where: { userId: p.userId } }),
    'userSettings.upsert': async (p: any) => {
      const { userId, ...data } = p
      return db.userSettings.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    },

    // Activities
    'activities.list': async (p: any) => {
      const where: Record<string, unknown> = {}
      if (p.projectId) where.projectId = p.projectId
      if (p.storyId) where.storyId = p.storyId
      return db.activity.findMany({ where, orderBy: { createdAt: 'desc' }, take: p.limit || 50 })
    },
    'activities.create': async (p: any) => db.activity.create({ data: p }),
  }

  return handlers[operation] || null
}
