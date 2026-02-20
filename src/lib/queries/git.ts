import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'

export function useGitStatus(workDir: string | undefined) {
  return useQuery({
    queryKey: ['git', 'status', workDir],
    queryFn: () => getTransport().git.status(workDir!),
    enabled: !!workDir,
    refetchInterval: 10000,
  })
}

export function useGitLog(workDir: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ['git', 'log', workDir, limit],
    queryFn: () => getTransport().git.log(workDir!, limit),
    enabled: !!workDir,
  })
}

export function useGitBranch(workDir: string | undefined) {
  return useQuery({
    queryKey: ['git', 'branch', workDir],
    queryFn: () => getTransport().git.branch(workDir!),
    enabled: !!workDir,
  })
}

export function useGitDiff(workDir: string | undefined, staged?: boolean) {
  return useQuery({
    queryKey: ['git', 'diff', workDir, staged],
    queryFn: () => getTransport().git.diff(workDir!, { staged }),
    enabled: !!workDir,
  })
}

export function useGitCommit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workDir, message }: { workDir: string; message: string }) =>
      getTransport().git.commit(workDir, message),
    onSuccess: (_, { workDir }) => {
      qc.invalidateQueries({ queryKey: ['git', 'status', workDir] })
      qc.invalidateQueries({ queryKey: ['git', 'log', workDir] })
    },
  })
}

export function useGitAdd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workDir, files }: { workDir: string; files: string[] }) =>
      getTransport().git.add(workDir, files),
    onSuccess: (_, { workDir }) => qc.invalidateQueries({ queryKey: ['git', 'status', workDir] }),
  })
}

export function useGitCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workDir, branch, create }: { workDir: string; branch: string; create?: boolean }) =>
      getTransport().git.checkout(workDir, branch, create),
    onSuccess: (_, { workDir }) => qc.invalidateQueries({ queryKey: ['git'] }),
  })
}
