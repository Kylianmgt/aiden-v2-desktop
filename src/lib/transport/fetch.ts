// AIDEN v2 - Transport-Aware Fetch

import { isElectron } from './index'

const LOCAL_USER_ID = 'local-demo-user'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export async function transportFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  if (isElectron()) {
    return ipcFetch<T>(path, options)
  }
  return httpFetch<T>(path, options)
}

async function httpFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options
  let url = path
  if (params) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) sp.set(k, String(v))
    }
    const qs = sp.toString()
    if (qs) url += `?${qs}`
  }
  const response = await fetch(url, { ...fetchOptions, headers: { 'Content-Type': 'application/json', ...fetchOptions.headers as Record<string, string> } })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  return response.json()
}

async function ipcFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const api = window.electronAPI
  if (!api) throw new Error('Electron API not available')
  const { params, method = 'GET', body } = options
  const operation = mapRouteToOperation(path, method)
  const queryParams = { ...params, ...(body ? JSON.parse(body as string) : {}) }
  const needsUser = ['projects.list', 'projects.create', 'chatSessions.create']
  if (needsUser.includes(operation) && !queryParams.userId) queryParams.userId = LOCAL_USER_ID
  return api.db.query<T>(operation, queryParams)
}

function mapRouteToOperation(path: string, method: string): string {
  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'api') segments.shift()
  const entity = segments[0]
  const hasId = segments.length > 1

  switch (method) {
    case 'GET': return hasId ? (segments.length > 2 ? `${segments[2]}.list` : `${entity}.get`) : `${entity}.list`
    case 'POST': return `${entity}.create`
    case 'PATCH': case 'PUT': return `${entity}.update`
    case 'DELETE': return `${entity}.delete`
    default: throw new Error(`Unsupported method: ${method}`)
  }
}

export const get = <T>(p: string, params?: Record<string, string | number | boolean | undefined>) => transportFetch<T>(p, { method: 'GET', params })
export const post = <T>(p: string, data: unknown) => transportFetch<T>(p, { method: 'POST', body: JSON.stringify(data) })
export const patch = <T>(p: string, data: unknown) => transportFetch<T>(p, { method: 'PATCH', body: JSON.stringify(data) })
export const del = <T>(p: string) => transportFetch<T>(p, { method: 'DELETE' })
