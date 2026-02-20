import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { AgentSessionsListParams, SpawnAgentOptions } from '../transport/types'

export function useAgentSessions(params?: AgentSessionsListParams) {
  return useQuery({
    queryKey: ['agentSessions', params],
    queryFn: () => getTransport().db.agentSessions.list(params),
  })
}

export function useAgentSession(id: string | undefined) {
  return useQuery({
    queryKey: ['agentSessions', id],
    queryFn: () => getTransport().db.agentSessions.get(id!),
    enabled: !!id,
  })
}

export function useSpawnAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (options: SpawnAgentOptions) => getTransport().agent.spawn(options),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agentSessions'] }),
  })
}

export function usePauseAgent() {
  return useMutation({ mutationFn: (id: string) => getTransport().agent.pause(id) })
}

export function useResumeAgent() {
  return useMutation({ mutationFn: (id: string) => getTransport().agent.resume(id) })
}

export function useCancelAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getTransport().agent.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agentSessions'] }),
  })
}

export function useAgentStream() {
  const t = getTransport()
  return {
    onOutput: (callback: (...args: unknown[]) => void) => t.events.on('agent:output', callback),
    onCompleted: (callback: (...args: unknown[]) => void) => t.events.on('agent:completed', callback),
    onFailed: (callback: (...args: unknown[]) => void) => t.events.on('agent:failed', callback),
  }
}
