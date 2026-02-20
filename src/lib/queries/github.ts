import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'

export function useGitHubUser() {
  return useQuery({
    queryKey: ['github', 'user'],
    queryFn: () => getTransport().github.getUser(),
    retry: false,
  })
}

export function useGitHubRepos() {
  return useQuery({
    queryKey: ['github', 'repos'],
    queryFn: () => getTransport().github.listRepos(),
  })
}

export function useGitHubBranches(owner: string | undefined, repo: string | undefined) {
  return useQuery({
    queryKey: ['github', 'branches', owner, repo],
    queryFn: () => getTransport().github.listBranches(owner!, repo!),
    enabled: !!owner && !!repo,
  })
}

export function useGitHubAuthenticate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => getTransport().github.authenticate(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github'] })
    },
  })
}

export function useGitHubClone() {
  return useMutation({
    mutationFn: ({ owner, repo, path, branch }: { owner: string; repo: string; path: string; branch?: string }) =>
      getTransport().github.clone(owner, repo, path, branch),
  })
}
