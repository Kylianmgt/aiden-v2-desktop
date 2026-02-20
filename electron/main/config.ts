// AIDEN v2 Desktop - Configuration

import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export interface AppConfig {
  mode: 'local' | 'remote' | 'hybrid'
  serverUrl: string
  databasePath: string
  authToken?: string
}

const DEFAULT_CONFIG: AppConfig = {
  mode: 'local',
  serverUrl: 'http://localhost:3000',
  databasePath: '',
}

let currentConfig: AppConfig | null = null

function getConfigPath(): string {
  try {
    return path.join(app.getPath('userData'), 'config.json')
  } catch {
    return path.join(process.cwd(), 'aiden-config.json')
  }
}

function getDefaultDbPath(): string {
  try {
    return path.join(app.getPath('userData'), 'aiden-local.db')
  } catch {
    return path.join(process.cwd(), 'aiden-local.db')
  }
}

export function loadConfig(): AppConfig {
  if (currentConfig) return currentConfig

  const configPath = getConfigPath()
  let config = { ...DEFAULT_CONFIG }

  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8')
      config = { ...config, ...JSON.parse(raw) }
    }
  } catch (error) {
    console.error('[Config] Failed to load:', error)
  }

  if (!config.databasePath) {
    config.databasePath = getDefaultDbPath()
  }

  // Env overrides
  if (process.env.AIDEN_MODE) config.mode = process.env.AIDEN_MODE as AppConfig['mode']
  if (process.env.AIDEN_SERVER_URL) config.serverUrl = process.env.AIDEN_SERVER_URL
  if (process.env.AIDEN_DB_PATH) config.databasePath = process.env.AIDEN_DB_PATH
  if (process.env.AIDEN_AUTH_TOKEN) config.authToken = process.env.AIDEN_AUTH_TOKEN

  currentConfig = config
  return config
}

export function saveConfig(config: Partial<AppConfig>): void {
  currentConfig = { ...loadConfig(), ...config }
  const configPath = getConfigPath()
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2))
  } catch (error) {
    console.error('[Config] Failed to save:', error)
  }
}

export function getConfig(): AppConfig {
  return loadConfig()
}

export function updateConfig(updates: Record<string, unknown>): AppConfig {
  saveConfig(updates as Partial<AppConfig>)
  return loadConfig()
}
