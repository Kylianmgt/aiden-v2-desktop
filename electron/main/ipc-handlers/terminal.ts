// AIDEN v2 Desktop - Terminal IPC Handlers

import { BrowserWindow, ipcMain } from 'electron'
import { terminalService } from '../services/terminal'

export function registerTerminalHandlers(mainWindow: BrowserWindow): void {
  terminalService.setMainWindow(mainWindow)

  ipcMain.handle('terminal:spawn', async (_event, options) => {
    return terminalService.spawn(options)
  })

  ipcMain.handle('terminal:write', async (_event, sessionId: string, data: string) => {
    return terminalService.write(sessionId, data)
  })

  ipcMain.handle('terminal:resize', async (_event, sessionId: string, cols: number, rows: number) => {
    return terminalService.resize(sessionId, cols, rows)
  })

  ipcMain.handle('terminal:kill', async (_event, sessionId: string) => {
    return terminalService.kill(sessionId)
  })

  ipcMain.handle('terminal:list', async () => {
    return terminalService.list()
  })
}
