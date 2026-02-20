// AIDEN v2 Desktop - Terminal IPC Handlers (stubbed)

import { BrowserWindow, ipcMain } from 'electron'

interface TerminalSession {
  id: string
  status: string
  createdAt: string
}

const sessions = new Map<string, TerminalSession>()

export function registerTerminalHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('terminal:spawn', async (_event, options: { id: string; cwd?: string }) => {
    // node-pty would be used here for real PTY support
    const session: TerminalSession = {
      id: options.id,
      status: 'running',
      createdAt: new Date().toISOString(),
    }
    sessions.set(session.id, session)
    mainWindow?.webContents.send('terminal:started', { sessionId: session.id })
    return session
  })

  ipcMain.handle('terminal:write', async (_event, sessionId: string, data: string) => {
    return sessions.has(sessionId)
  })

  ipcMain.handle('terminal:resize', async (_event, sessionId: string, cols: number, rows: number) => {
    return sessions.has(sessionId)
  })

  ipcMain.handle('terminal:kill', async (_event, sessionId: string) => {
    const session = sessions.get(sessionId)
    if (session) {
      session.status = 'closed'
      sessions.delete(sessionId)
      mainWindow?.webContents.send('terminal:closed', { sessionId })
      return true
    }
    return false
  })
}
