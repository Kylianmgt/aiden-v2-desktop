import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { CreateStoryData, Story, StoriesListParams } from '../transport/types'

export function useStories(params: StoriesListParams) {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: async () => { const t = getTransport(); return t.db.stories.list(params) },
    enabled: !!(params.epicId || params.projectId),
  })
}

export function useStory(id: string | undefined) {
  return useQuery({
    queryKey: ['stories', 'detail', id],
    queryFn: async () => { const t = getTransport(); return t.db.stories.get(id!) },
    enabled: !!id,
  })
}

export function useCreateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateStoryData) => { const t = getTransport(); return t.db.stories.create(data) },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['stories'] }),
  })
}

export function useUpdateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Story>) => { const t = getTransport(); return t.db.stories.update(id, data) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  })
}

export function useDeleteStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { const t = getTransport(); return t.db.stories.delete(id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  })
}
