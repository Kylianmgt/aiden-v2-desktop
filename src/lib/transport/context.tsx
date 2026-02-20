// AIDEN v2 - Transport Context Provider

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Transport, TransportMode } from './types'
import { createTransport, isElectron } from './index'

interface TransportContextValue {
  transport: Transport | null
  mode: TransportMode | null
  isReady: boolean
  isElectron: boolean
  error: Error | null
  switchMode: (mode: TransportMode) => Promise<void>
}

const TransportContext = createContext<TransportContextValue | null>(null)

interface TransportProviderProps {
  children: ReactNode
  initialMode?: TransportMode
  serverUrl?: string
}

export function TransportProvider({ children, initialMode, serverUrl }: TransportProviderProps) {
  const [transport, setTransport] = useState<Transport | null>(null)
  const [mode, setMode] = useState<TransportMode | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const init = useCallback(async (m?: TransportMode) => {
    try {
      setError(null)
      setIsReady(false)
      const t = await createTransport(m)
      setTransport(t)
      setMode(t.getMode())
      setIsReady(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Transport init failed'))
    }
  }, [])

  const switchMode = useCallback(async (newMode: TransportMode) => {
    await init(newMode)
  }, [init])

  useEffect(() => { init(initialMode) }, [init, initialMode])

  return (
    <TransportContext.Provider value={{ transport, mode, isReady, isElectron: isElectron(), error, switchMode }}>
      {children}
    </TransportContext.Provider>
  )
}

export function useTransport(): TransportContextValue {
  const ctx = useContext(TransportContext)
  if (!ctx) throw new Error('useTransport must be used within TransportProvider')
  return ctx
}

export function useTransportDB() {
  const { transport, isReady } = useTransport()
  if (!isReady || !transport) throw new Error('Transport not ready')
  return transport.db
}

export function useTransportMode(): TransportMode | null {
  return useTransport().mode
}

export function useIsLocalMode(): boolean {
  return useTransport().mode === 'local'
}

export function useIsRemoteMode(): boolean {
  return useTransport().mode === 'remote'
}
