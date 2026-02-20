import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { UserSettings } from '../transport/types'

const LOCAL_USER_ID = 'local-demo-user'

export function useSettings(userId?: string) {
  const uid = userId || LOCAL_USER_ID
  return useQuery({
    queryKey: ['settings', uid],
    queryFn: () => getTransport().db.userSettings.get(uid),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, ...data }: { userId?: string } & Partial<UserSettings>) =>
      getTransport().db.userSettings.upsert(userId || LOCAL_USER_ID, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
