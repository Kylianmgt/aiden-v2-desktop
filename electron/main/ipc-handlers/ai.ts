// AIDEN v2 Desktop - AI IPC Handlers

import { BrowserWindow, ipcMain } from 'electron'
import { aiService } from '../services/ai'

export function registerAIHandlers(mainWindow: BrowserWindow): void {
  aiService.setMainWindow(mainWindow)

  ipcMain.handle('ai:chat', async (_event, params) => {
    return aiService.chat(params)
  })

  ipcMain.handle('ai:stream', async (_event, params) => {
    return aiService.stream(params)
  })

  ipcMain.handle('ai:cancel', async (_event, streamId: string) => {
    aiService.cancelStream(streamId)
  })
}
