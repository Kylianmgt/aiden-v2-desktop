import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { MemoryFilter, CreateMemoryData } from '../transport/types'

export function useMemory(projectId: string | undefined, filter?: MemoryFilter) {
  return useQuery({
    queryKey: ['memory', projectId, filter],
    queryFn: () => getTransport().memory.list(projectId!, filter),
    enabled: !!projectId,
  })
}

export function useMemoryStats(projectId: string | undefined) {
  return useQuery({
    queryKey: ['memoryStats', projectId],
    queryFn: () => getTransport().memory.getStats(projectId!),
    enabled: !!projectId,
  })
}

export function useCreateMemory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMemoryData) => getTransport().memory.create(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['memory', vars.projectId] }),
  })
}

export function useUpdateMemory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      getTransport().memory.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memory'] }),
  })
}

export function useDeprecateMemory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getTransport().memory.deprecate(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memory'] }),
  })
}

export function useEnrichContext(projectId: string | undefined, storyId?: string) {
  return useQuery({
    queryKey: ['enrichContext', projectId, storyId],
    queryFn: () => getTransport().memory.enrichContext(projectId!, storyId),
    enabled: !!projectId,
  })
}
