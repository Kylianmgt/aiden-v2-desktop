import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { CreatePromptTemplateData, PromptTemplate } from '../transport/types'

export function usePromptTemplates(category?: string) {
  return useQuery({
    queryKey: ['promptTemplates', category],
    queryFn: () => getTransport().db.promptTemplates.list(category ? { category } : undefined),
  })
}

export function usePromptTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['promptTemplates', id],
    queryFn: () => getTransport().db.promptTemplates.get(id!),
    enabled: !!id,
  })
}

export function useCreatePromptTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePromptTemplateData) => getTransport().db.promptTemplates.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promptTemplates'] }),
  })
}

export function useUpdatePromptTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<PromptTemplate>) =>
      getTransport().db.promptTemplates.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promptTemplates'] }),
  })
}

export function useDeletePromptTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getTransport().db.promptTemplates.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promptTemplates'] }),
  })
}
