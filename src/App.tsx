// AIDEN v2 - App Root (providers only, no UI)

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransportProvider } from './lib/transport/context'
import { TestPage } from './pages/test'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TransportProvider>
        <TestPage />
      </TransportProvider>
    </QueryClientProvider>
  )
}
