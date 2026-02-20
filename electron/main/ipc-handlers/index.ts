// AIDEN v2 Desktop - IPC Handlers Registration

import { BrowserWindow, ipcMain, app, shell } from 'electron'
import { registerDatabaseHandlers } from './database'
import { registerFilesystemHandlers } from './filesystem'
import { registerStreamHandlers } from './stream'
import { registerTerminalHandlers } from './terminal'
import { registerAgentHandlers } from './agent'
import { registerGitHandlers } from './git'
import { registerAIHandlers } from './ai'
import { registerGitHubHandlers } from './github'
import { getConfig, updateConfig } from '../config'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  console.log('[IPC] Registering handlers...')

  registerDatabaseHandlers()
  registerFilesystemHandlers()
  registerStreamHandlers(mainWindow)
  registerTerminalHandlers(mainWindow)
  registerAgentHandlers(mainWindow)
  registerGitHandlers()
  registerAIHandlers(mainWindow)
  registerGitHubHandlers()

  // App handlers
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:path', (_event, name: string) => {
    const valid = ['home', 'appData', 'userData', 'temp', 'desktop', 'documents']
    if (!valid.includes(name)) throw new Error(`Invalid path: ${name}`)
    return app.getPath(name as Parameters<typeof app.getPath>[0])
  })

  // Config handlers
  ipcMain.handle('config:get', () => getConfig())
  ipcMain.handle('config:set', (_event, updates: Record<string, unknown>) => updateConfig(updates))

  // Settings handlers (convenience wrappers over db:query)
  ipcMain.handle('settings:get', async (_event, userId: string) => {
    const { getDatabaseClient } = require('../services/database')
    const db = getDatabaseClient()
    if (!db) return null
    return db.userSettings.findUnique({ where: { userId } })
  })
  ipcMain.handle('settings:update', async (_event, userId: string, data: Record<string, unknown>) => {
    const { getDatabaseClient } = require('../services/database')
    const db = getDatabaseClient()
    if (!db) throw new Error('Database not initialized')
    return db.userSettings.upsert({ where: { userId }, create: { userId, ...data }, update: data })
  })

  // Shell handlers
  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
    await shell.openExternal(url)
  })
  ipcMain.on('shell:showItemInFolder', (_event, p: string) => shell.showItemInFolder(p))

  console.log('[IPC] All handlers registered')
}
