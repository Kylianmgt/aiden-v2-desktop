// AIDEN v2 Desktop - Stream IPC Handlers

import { BrowserWindow, ipcMain } from 'electron'
import crypto from 'crypto'
import { aiService } from '../services/ai'

const activeStreams = new Map<string, AbortController>()

export function registerStreamHandlers(mainWindow: BrowserWindow): void {
  aiService.setMainWindow(mainWindow)

  ipcMain.handle('stream:start', async (_event, endpoint: string, data: any) => {
    const streamId = crypto.randomUUID()
    const controller = new AbortController()
    activeStreams.set(streamId, controller)

    // Route to AI service for chat/generation endpoints
    if (endpoint.includes('chat') || endpoint.includes('generate') || endpoint.includes('prd') || endpoint.includes('spec')) {
      try {
        const aiStreamId = await aiService.stream({
          messages: data.messages || [{ role: 'user', content: data.prompt || data.content || '' }],
          systemPrompt: data.systemPrompt,
          model: data.model,
          maxTokens: data.maxTokens,
        })
        // The AI service uses its own stream IDs but we map them
        return aiStreamId
      } catch (err: any) {
        mainWindow.webContents.send('stream:error', { streamId, error: err.message })
        return streamId
      }
    }

    // Fallback: placeholder stream
    setTimeout(() => {
      mainWindow.webContents.send('stream:data', {
        streamId,
        type: 'text',
        content: `[Stream ${streamId}] Started for ${endpoint}`,
      })
      mainWindow.webContents.send('stream:done', { streamId })
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
    aiService.cancelStream(streamId)
  })
}
