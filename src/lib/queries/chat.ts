import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { ChatSessionsListParams, CreateChatSessionData, CreateChatMessageData } from '../transport/types'

export function useChatSessions(params: ChatSessionsListParams) {
  return useQuery({
    queryKey: ['chatSessions', params],
    queryFn: () => getTransport().db.chatSessions.list(params),
    enabled: !!(params.projectId || params.userId),
  })
}

export function useChatSession(id: string | undefined) {
  return useQuery({
    queryKey: ['chatSessions', id],
    queryFn: () => getTransport().db.chatSessions.get(id!),
    enabled: !!id,
  })
}

export function useChatMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => getTransport().db.chatMessages.list(sessionId!),
    enabled: !!sessionId,
  })
}

export function useCreateChatSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChatSessionData) => getTransport().db.chatSessions.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatSessions'] }),
  })
}

export function useSendChatMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChatMessageData) => getTransport().db.chatMessages.create(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['chatMessages', vars.sessionId] }),
  })
}

export function useDeleteChatSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getTransport().db.chatSessions.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatSessions'] }),
  })
}
