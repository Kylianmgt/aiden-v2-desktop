// AIDEN v2 Desktop - Preload Script

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export interface ElectronAPI {
  isElectron: boolean
  platform: NodeJS.Platform
  versions: { node: string; chrome: string; electron: string }
  getAppVersion: () => Promise<string>
  getConfig: () => Promise<unknown>
  setConfig: (config: Record<string, unknown>) => Promise<void>
  db: {
    query: <T>(operation: string, params?: unknown) => Promise<T>
  }
  fs: {
    readFile: (filePath: string) => Promise<string>
    writeFile: (filePath: string, content: string) => Promise<void>
    readDir: (dirPath: string) => Promise<unknown[]>
    exists: (path: string) => Promise<boolean>
    mkdir: (dirPath: string, recursive?: boolean) => Promise<void>
    remove: (path: string) => Promise<void>
    selectDirectory: () => Promise<string | null>
  }
  stream: {
    start: (endpoint: string, data: unknown) => Promise<string>
    cancel: (streamId: string) => Promise<void>
  }
  terminal: {
    spawn: (options: unknown) => Promise<unknown>
    write: (sessionId: string, data: string) => Promise<boolean>
    resize: (sessionId: string, cols: number, rows: number) => Promise<boolean>
    kill: (sessionId: string) => Promise<boolean>
  }
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
  once: (channel: string, callback: (...args: unknown[]) => void) => void
  shell: {
    openExternal: (url: string) => Promise<void>
  }
}

const validChannels = [
  'agent:created', 'agent:started', 'agent:output', 'agent:completed',
  'agent:failed', 'agent:paused', 'agent:cancelled',
  'terminal:started', 'terminal:output', 'terminal:closed', 'terminal:error',
  'stream:data', 'stream:done', 'stream:error',
  'app:update-available', 'app:update-downloaded', 'app:error',
] as const

type ValidChannel = (typeof validChannels)[number]

function isValidChannel(channel: string): channel is ValidChannel {
  return (validChannels as readonly string[]).includes(channel)
}

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args)
}

const electronAPI: ElectronAPI = {
  isElectron: true,
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  getAppVersion: () => invoke('app:version'),
  getConfig: () => invoke('config:get'),
  setConfig: (config) => invoke('config:set', config),
  db: {
    query: (operation, params) => invoke('db:query', { operation, params }),
  },
  fs: {
    readFile: (p) => invoke('fs:readFile', p),
    writeFile: (p, c) => invoke('fs:writeFile', p, c),
    readDir: (p) => invoke('fs:readDir', p),
    exists: (p) => invoke('fs:exists', p),
    mkdir: (p, r) => invoke('fs:mkdir', p, r),
    remove: (p) => invoke('fs:remove', p),
    selectDirectory: () => invoke('fs:selectDirectory'),
  },
  stream: {
    start: (endpoint, data) => invoke('stream:start', endpoint, data),
    cancel: (streamId) => invoke('stream:cancel', streamId),
  },
  terminal: {
    spawn: (options) => invoke('terminal:spawn', options),
    write: (sid, data) => invoke('terminal:write', sid, data),
    resize: (sid, c, r) => invoke('terminal:resize', sid, c, r),
    kill: (sid) => invoke('terminal:kill', sid),
  },
  on: (channel, callback) => {
    if (!isValidChannel(channel)) {
      console.error(`[Preload] Invalid channel: ${channel}`)
      return () => {}
    }
    const handler = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
  once: (channel, callback) => {
    if (!isValidChannel(channel)) return
    ipcRenderer.once(channel, (_event, ...args) => callback(...args))
  },
  shell: {
    openExternal: (url) => invoke('shell:openExternal', url),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
