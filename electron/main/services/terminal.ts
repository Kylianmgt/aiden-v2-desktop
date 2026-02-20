// AIDEN v2 Desktop - Terminal Service
// PTY spawning with node-pty (stubbed if unavailable)

import crypto from 'crypto'

// Try to load node-pty, stub if unavailable
let nodePty: any = null
try {
  nodePty = require('node-pty')
} catch {
  console.warn('[Terminal] node-pty not available — terminal sessions will be stubbed')
}

export interface TerminalSessionInfo {
  id: string
  status: 'running' | 'closed' | 'error'
  pid?: number
  pty?: any
  cwd?: string
  createdAt: string
}

const sessions = new Map<string, TerminalSessionInfo>()

export class TerminalService {
  private mainWindow: Electron.BrowserWindow | null = null

  setMainWindow(win: Electron.BrowserWindow) {
    this.mainWindow = win
  }

  private send(channel: string, ...args: unknown[]) {
    this.mainWindow?.webContents.send(channel, ...args)
  }

  async spawn(options: { id?: string; cwd?: string; cols?: number; rows?: number }): Promise<TerminalSessionInfo> {
    const id = options.id || crypto.randomUUID()

    if (!nodePty) {
      // Stub: create a session record but no actual PTY
      const session: TerminalSessionInfo = {
        id,
        status: 'error',
        cwd: options.cwd,
        createdAt: new Date().toISOString(),
      }
      sessions.set(id, session)
      this.send('terminal:error', {
        sessionId: id,
        error: 'node-pty not available. Install node-pty for terminal support. TODO: native module rebuild.',
      })
      return session
    }

    const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || 'bash'
    const pty = nodePty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: options.cols || 80,
      rows: options.rows || 24,
      cwd: options.cwd || process.env.HOME || process.cwd(),
      env: process.env,
    })

    const session: TerminalSessionInfo = {
      id,
      status: 'running',
      pid: pty.pid,
      pty,
      cwd: options.cwd,
      createdAt: new Date().toISOString(),
    }

    sessions.set(id, session)

    pty.onData((data: string) => {
      this.send('terminal:output', { sessionId: id, data })
    })

    pty.onExit(({ exitCode }: { exitCode: number }) => {
      session.status = 'closed'
      sessions.delete(id)
      this.send('terminal:closed', { sessionId: id, exitCode })
    })

    this.send('terminal:started', { sessionId: id, pid: pty.pid })
    return session
  }

  async write(sessionId: string, data: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session?.pty) return false
    session.pty.write(data)
    return true
  }

  async resize(sessionId: string, cols: number, rows: number): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session?.pty) return false
    session.pty.resize(cols, rows)
    return true
  }

  async kill(sessionId: string): Promise<boolean> {
    const session = sessions.get(sessionId)
    if (!session) return false
    if (session.pty) {
      session.pty.kill()
    }
    session.status = 'closed'
    sessions.delete(sessionId)
    this.send('terminal:closed', { sessionId })
    return true
  }

  async list(): Promise<TerminalSessionInfo[]> {
    return Array.from(sessions.values()).map(({ pty, ...rest }) => rest)
  }
}

export const terminalService = new TerminalService()
