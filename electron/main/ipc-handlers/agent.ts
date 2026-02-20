// AIDEN v2 Desktop - Agent IPC Handlers

import { BrowserWindow, ipcMain } from 'electron'
import { agentService } from '../services/agent'

export function registerAgentHandlers(mainWindow: BrowserWindow): void {
  agentService.setMainWindow(mainWindow)

  ipcMain.handle('agent:spawn', async (_event, options) => {
    return agentService.spawn(options)
  })

  ipcMain.handle('agent:pause', async (_event, sessionId: string) => {
    return agentService.pause(sessionId)
  })

  ipcMain.handle('agent:resume', async (_event, sessionId: string) => {
    return agentService.resume(sessionId)
  })

  ipcMain.handle('agent:cancel', async (_event, sessionId: string) => {
    return agentService.cancel(sessionId)
  })

  ipcMain.handle('agent:list', async () => {
    return agentService.list()
  })

  ipcMain.handle('agent:get', async (_event, sessionId: string) => {
    return agentService.get(sessionId)
  })
}
