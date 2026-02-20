// AIDEN v2 Desktop - Agent Service
// Ported from v1 agent-manager.ts — spawns Claude Code CLI or API calls

import { spawn, ChildProcess } from 'child_process'
import crypto from 'crypto'
import { getDatabaseClient } from './database'
import { getLocalUserId } from './database'

export interface AgentSessionInfo {
  id: string
  dbSessionId: string
  storyId: string
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  progress: number
  process?: ChildProcess
  output: string[]
  error?: string
  createdAt: string
}

const sessions = new Map<string, AgentSessionInfo>()

export class AgentService {
  private mainWindow: Electron.BrowserWindow | null = null

  setMainWindow(win: Electron.BrowserWindow) {
    this.mainWindow = win
  }

  private send(channel: string, ...args: unknown[]) {
    this.mainWindow?.webContents.send(channel, ...args)
  }

  async spawn(options: {
    storyId: string
    systemPrompt: string
    userPrompt: string
    workspacePath?: string
    config?: { model?: string; timeout?: number; workingDirectory?: string }
  }): Promise<AgentSessionInfo> {
    const db = getDatabaseClient()
    if (!db) throw new Error('Database not initialized')

    // Create DB session
    const dbSession = await db.agentSession.create({
      data: {
        storyId: options.storyId,
        status: 'QUEUED',
        workspacePath: options.workspacePath,
      },
    })

    const sessionId = crypto.randomUUID()
    const session: AgentSessionInfo = {
      id: sessionId,
      dbSessionId: dbSession.id,
      storyId: options.storyId,
      status: 'running',
      progress: 0,
      output: [],
      createdAt: new Date().toISOString(),
    }

    sessions.set(sessionId, session)

    // Update DB status
    await db.agentSession.update({
      where: { id: dbSession.id },
      data: { status: 'RUNNING', startedAt: new Date() },
    })

    this.send('agent:created', { sessionId, dbSessionId: dbSession.id })

    // Spawn Claude Code CLI
    try {
      const cwd = options.config?.workingDirectory || options.workspacePath || process.cwd()
      const args = ['--print', '--output-format', 'stream-json']
      if (options.systemPrompt) {
        args.push('--system-prompt', options.systemPrompt)
      }
      args.push(options.userPrompt)

      const child = spawn('claude', args, {
        cwd,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      session.process = child

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString()
        session.output.push(text)
        this.send('agent:output', { sessionId, type: 'stdout', data: text })

        // Try parse streaming JSON for progress
        try {
          const lines = text.split('\n').filter(Boolean)
          for (const line of lines) {
            const parsed = JSON.parse(line)
            if (parsed.type === 'result') {
              session.progress = 100
            }
          }
        } catch { /* not JSON, that's fine */ }
      })

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString()
        session.output.push(text)
        this.send('agent:output', { sessionId, type: 'stderr', data: text })
      })

      child.on('close', async (code) => {
        session.status = code === 0 ? 'completed' : 'failed'
        if (code !== 0) session.error = `Process exited with code ${code}`
        session.progress = 100

        await db.agentSession.update({
          where: { id: dbSession.id },
          data: {
            status: code === 0 ? 'COMPLETED' : 'FAILED',
            progress: 100,
            completedAt: new Date(),
            error: session.error,
          },
        })

        this.send(code === 0 ? 'agent:completed' : 'agent:failed', {
          sessionId,
          dbSessionId: dbSession.id,
          error: session.error,
        })
      })

      this.send('agent:started', { sessionId, dbSessionId: dbSession.id })
    } catch (err) {
      session.status = 'failed'
      session.error = err instanceof Error ? err.message : String(err)

      await db.agentSession.update({
        where: { id: dbSession.id },
        data: { status: 'FAILED', error: session.error, completedAt: new Date() },
      })

      this.send('agent:failed', { sessionId, dbSessionId: dbSession.id, error: session.error })
    }

    return session
  }

  async pause(sessionId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session || session.status !== 'running') return false
    session.process?.kill('SIGSTOP')
    session.status = 'paused'
    this.send('agent:paused', { sessionId })
    return true
  }

  async resume(sessionId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session || session.status !== 'paused') return false
    session.process?.kill('SIGCONT')
    session.status = 'running'
    this.send('agent:started', { sessionId })
    return true
  }

  async cancel(sessionId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session) return false
    session.process?.kill('SIGTERM')
    session.status = 'cancelled'

    const db = getDatabaseClient()
    if (db) {
      await db.agentSession.update({
        where: { id: session.dbSessionId },
        data: { status: 'CANCELLED', completedAt: new Date() },
      })
    }

    this.send('agent:cancelled', { sessionId })
    return true
  }

  async list(): Promise<AgentSessionInfo[]> {
    return Array.from(sessions.values())
  }

  async get(sessionId: string): Promise<AgentSessionInfo | null> {
    return sessions.get(sessionId) || null
  }
}

export const agentService = new AgentService()
