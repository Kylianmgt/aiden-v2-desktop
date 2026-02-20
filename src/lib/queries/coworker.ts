import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { getTransport } from '../transport'
import type { AIChatParams } from '../transport/types'
import { useState, useCallback, useRef, useEffect } from 'react'

// Coworker chat uses the stream adapter for AI interactions
export function useCoworkerChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const streamIdRef = useRef<string | null>(null)

  const sendMessage = useCallback(async (content: string, systemPrompt?: string) => {
    const t = getTransport()
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setIsStreaming(true)
    setStreamContent('')

    try {
      const streamId = await t.ai.stream({
        messages: newMessages,
        systemPrompt: systemPrompt || 'You are a helpful AI coworker assistant for software development.',
      })
      streamIdRef.current = streamId

      const unsub = t.stream.onData(streamId, (event) => {
        if (event.content) {
          setStreamContent(prev => prev + event.content)
        }
      })

      t.stream.onDone(streamId, () => {
        setIsStreaming(false)
        setMessages(prev => [...prev, { role: 'assistant', content: streamContent }])
        unsub()
      })
    } catch (err) {
      setIsStreaming(false)
    }
  }, [messages, streamContent])

  const cancel = useCallback(() => {
    if (streamIdRef.current) {
      getTransport().stream.cancel(streamIdRef.current)
      setIsStreaming(false)
    }
  }, [])

  const clear = useCallback(() => {
    setMessages([])
    setStreamContent('')
  }, [])

  return { messages, isStreaming, streamContent, sendMessage, cancel, clear }
}
