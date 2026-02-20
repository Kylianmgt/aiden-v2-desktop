import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { CreateEpicData, Epic } from '../transport/types'

export function useEpics(projectId: string | undefined) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: async () => { const t = getTransport(); return t.db.epics.list(projectId!) },
    enabled: !!projectId,
  })
}

export function useEpic(id: string | undefined) {
  return useQuery({
    queryKey: ['epics', 'detail', id],
    queryFn: async () => { const t = getTransport(); return t.db.epics.get(id!) },
    enabled: !!id,
  })
}

export function useCreateEpic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEpicData) => { const t = getTransport(); return t.db.epics.create(data) },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['epics', vars.projectId] }),
  })
}

export function useUpdateEpic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Epic>) => { const t = getTransport(); return t.db.epics.update(id, data) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics'] }),
  })
}

export function useDeleteEpic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const t = getTransport(); return t.db.epics.delete(id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics'] }),
  })
}
