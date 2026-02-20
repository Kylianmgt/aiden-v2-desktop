// AIDEN v2 - Transport Factory

import type { Transport, TransportMode } from './types'

let transportInstance: Transport | null = null
let transportMode: TransportMode | null = null

export function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined' && window.electronAPI?.isElectron === true
}

export async function createTransport(mode?: TransportMode): Promise<Transport> {
  if (transportInstance && (!mode || mode === transportMode)) return transportInstance

  const resolvedMode = mode || (isElectron() ? 'local' : 'remote')
  transportMode = resolvedMode

  if (resolvedMode === 'local' || resolvedMode === 'hybrid') {
    const { createLocalTransport } = await import('./local-transport')
    transportInstance = createLocalTransport(resolvedMode)
  } else {
    const { createRemoteTransport } = await import('./remote-transport')
    transportInstance = createRemoteTransport()
  }

  return transportInstance
}

export function getTransport(): Transport {
  if (!transportInstance) throw new Error('Transport not initialized. Call createTransport() first.')
  return transportInstance
}

export function getTransportMode(): TransportMode | null {
  return transportMode
}

export * from './types'
