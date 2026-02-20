// AIDEN v2 Desktop - AI Service (local mode)
// Direct API calls to Anthropic/OpenAI from Electron main process

import crypto from 'crypto'
import https from 'https'
import { getDatabaseClient } from './database'

export interface AIChatParams {
  messages: Array<{ role: string; content: string }>
  model?: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

const activeStreams = new Map<string, AbortController>()

export class AIService {
  private mainWindow: Electron.BrowserWindow | null = null

  setMainWindow(win: Electron.BrowserWindow) {
    this.mainWindow = win
  }

  private send(channel: string, ...args: unknown[]) {
    this.mainWindow?.webContents.send(channel, ...args)
  }

  private async getApiKey(provider: string): Promise<string | null> {
    const db = getDatabaseClient()
    if (!db) return null
    const settings = await db.userSettings.findFirst()
    if (!settings) return null
    if (provider === 'anthropic' || provider === 'claude') return settings.claudeApiKey || null
    if (provider === 'openai') return settings.openaiApiKey || null
    return null
  }

  private async getProvider(): Promise<string> {
    const db = getDatabaseClient()
    if (!db) return 'anthropic'
    const settings = await db.userSettings.findFirst()
    return settings?.selectedAiProvider || 'anthropic'
  }

  async chat(params: AIChatParams): Promise<string> {
    const provider = await this.getProvider()
    const apiKey = await this.getApiKey(provider)
    if (!apiKey) throw new Error(`No API key configured for ${provider}`)

    if (provider === 'openai') {
      return this.chatOpenAI(params, apiKey)
    }
    return this.chatAnthropic(params, apiKey)
  }

  async stream(params: AIChatParams): Promise<string> {
    const streamId = crypto.randomUUID()
    const controller = new AbortController()
    activeStreams.set(streamId, controller)

    const provider = await this.getProvider()
    const apiKey = await this.getApiKey(provider)
    if (!apiKey) {
      this.send('stream:error', { streamId, error: `No API key for ${provider}` })
      return streamId
    }

    // Run async
    this.streamAnthropic(streamId, params, apiKey, controller.signal).catch(err => {
      this.send('stream:error', { streamId, error: err.message })
    })

    return streamId
  }

  cancelStream(streamId: string) {
    const controller = activeStreams.get(streamId)
    if (controller) {
      controller.abort()
      activeStreams.delete(streamId)
    }
  }

  private async chatAnthropic(params: AIChatParams, apiKey: string): Promise<string> {
    const body = JSON.stringify({
      model: params.model || 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 4096,
      messages: params.messages,
      ...(params.systemPrompt ? { system: params.systemPrompt } : {}),
    })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    })

    if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`)
    const data = await res.json() as any
    return data.content?.[0]?.text || ''
  }

  private async chatOpenAI(params: AIChatParams, apiKey: string): Promise<string> {
    const messages = params.systemPrompt
      ? [{ role: 'system', content: params.systemPrompt }, ...params.messages]
      : params.messages

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: params.model || 'gpt-4o',
        messages,
        max_tokens: params.maxTokens || 4096,
        temperature: params.temperature,
      }),
    })

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`)
    const data = await res.json() as any
    return data.choices?.[0]?.message?.content || ''
  }

  private async streamAnthropic(streamId: string, params: AIChatParams, apiKey: string, signal: AbortSignal): Promise<void> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: params.model || 'claude-sonnet-4-20250514',
        max_tokens: params.maxTokens || 4096,
        messages: params.messages,
        stream: true,
        ...(params.systemPrompt ? { system: params.systemPrompt } : {}),
      }),
      signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      this.send('stream:error', { streamId, error: `Anthropic ${res.status}: ${errText}` })
      return
    }

    const reader = res.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)
            if (event.type === 'content_block_delta' && event.delta?.text) {
              this.send('stream:data', { streamId, type: 'text', content: event.delta.text })
            } else if (event.type === 'message_stop') {
              // done
            }
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.send('stream:data', { streamId, type: 'message', content: '[cancelled]' })
      } else {
        throw err
      }
    } finally {
      activeStreams.delete(streamId)
      this.send('stream:done', { streamId })
    }
  }
}

export const aiService = new AIService()
