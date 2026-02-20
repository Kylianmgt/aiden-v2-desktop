// AIDEN v2 Desktop - Stream IPC Handlers

import { BrowserWindow, ipcMain } from 'electron'
import crypto from 'crypto'

const activeStreams = new Map<string, AbortController>()

export function registerStreamHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('stream:start', async (_event, endpoint: string, data: unknown) => {
    const streamId = crypto.randomUUID()
    const controller = new AbortController()
    activeStreams.set(streamId, controller)

    // For local mode, stream handling would dispatch to local AI providers
    // For now, emit a placeholder event
    setTimeout(() => {
      mainWindow?.webContents.send('stream:data', {
        streamId,
        type: 'text',
        content: `[Stream ${streamId}] Started for ${endpoint}`,
      })
      mainWindow?.webContents.send('stream:done', { streamId })
      activeStreams.delete(streamId)
    }, 100)

    return streamId
  })

  ipcMain.handle('stream:cancel', async (_event, streamId: string) => {
    const controller = activeStreams.get(streamId)
    if (controller) {
      controller.abort()
      activeStreams.delete(streamId)
    }
  })
}
