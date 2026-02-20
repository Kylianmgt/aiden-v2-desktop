// AIDEN v2 - Transport Layer Tests

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTransport, isElectron } from '../index'

describe('Transport Factory', () => {
  beforeEach(() => {
    // Reset module state
    vi.resetModules()
  })

  it('isElectron returns false in test env', () => {
    expect(isElectron()).toBe(false)
  })

  it('creates remote transport when not in Electron', async () => {
    // Mock fetch for remote transport
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    const transport = await createTransport('remote')
    expect(transport.getMode()).toBe('remote')
    expect(transport.isConnected()).toBe(true)
  })

  it('transport has all required adapters', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    const transport = await createTransport('remote')
    expect(transport.db).toBeDefined()
    expect(transport.db.projects).toBeDefined()
    expect(transport.db.epics).toBeDefined()
    expect(transport.db.stories).toBeDefined()
    expect(transport.db.specs).toBeDefined()
    expect(transport.db.activities).toBeDefined()
    expect(transport.db.userSettings).toBeDefined()
    expect(transport.events).toBeDefined()
    expect(transport.stream).toBeDefined()
    expect(transport.fs).toBeDefined()
    expect(transport.auth).toBeDefined()
  })
})

describe('Remote Transport - HTTP', () => {
  it('projects.list calls correct endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'Test' }]),
    })
    globalThis.fetch = mockFetch

    const transport = await createTransport('remote')
    const projects = await transport.db.projects.list()

    expect(mockFetch).toHaveBeenCalled()
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/projects')
    expect(projects).toHaveLength(1)
  })

  it('projects.create sends POST', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'new', name: 'Created' }),
    })
    globalThis.fetch = mockFetch

    const transport = await createTransport('remote')
    const project = await transport.db.projects.create({
      userId: 'user1',
      name: 'Created',
      slug: 'created',
    })

    expect(project.id).toBe('new')
    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
  })

  it('handles HTTP errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found'),
    })

    const transport = await createTransport('remote')
    await expect(transport.db.projects.get('nonexistent')).rejects.toThrow('HTTP 404')
  })

  it('auth.getCurrentUser calls /api/auth/me', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'u1', email: 'test@test.com', name: 'Test' }),
    })
    globalThis.fetch = mockFetch

    const transport = await createTransport('remote')
    const user = await transport.auth.getCurrentUser()
    expect(user?.email).toBe('test@test.com')
  })
})

describe('Transport Types', () => {
  it('TransportMode includes local, remote, hybrid', async () => {
    // Type check - if this compiles, it passes
    const modes: import('../types').TransportMode[] = ['local', 'remote', 'hybrid']
    expect(modes).toHaveLength(3)
  })
})
