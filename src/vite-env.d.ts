/// <reference types="vite/client" />

interface Window {
  electronAPI: import('../electron/main/preload').ElectronAPI
}
