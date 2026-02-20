// AIDEN v2 - Project Queries

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { CreateProjectData, Project } from '../transport/types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const t = getTransport()
      return t.db.projects.list()
    },
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const t = getTransport()
      return t.db.projects.get(id!)
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const t = getTransport()
      return t.db.projects.create(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Project>) => {
      const t = getTransport()
      return t.db.projects.update(id, data)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', vars.id] })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const t = getTransport()
      return t.db.projects.delete(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
