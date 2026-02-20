#!/usr/bin/env npx tsx
// AIDEN v2 - Remote Server Connection Test
// Tests the NestJS server API endpoints

const BASE_URL = process.env.AIDEN_SERVER_URL || 'http://localhost:3000'

let token = ''
let passed = 0, failed = 0, skipped = 0

async function fetchJson(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`   PASS ✅ ${name}`)
    passed++
  } catch (e: any) {
    console.log(`   FAIL ❌ ${name}: ${e.message}`)
    failed++
  }
}

async function main() {
  console.log('=== AIDEN v2 Remote Connection Test ===')
  console.log(`Server: ${BASE_URL}\n`)

  // Check server is reachable
  try {
    await fetch(`${BASE_URL}`, { signal: AbortSignal.timeout(3000) })
  } catch {
    console.log('⚠️  Server not reachable at ' + BASE_URL)
    console.log('   Start the NestJS server first, or set AIDEN_SERVER_URL')
    console.log('   Server needs PostgreSQL (check /tmp/aiden-v2-server/docker-compose.yaml)')
    console.log('\nSKIPPED - server not available')
    process.exit(0)
  }

  const testEmail = `test-${Date.now()}@test.com`
  let projectId = '', epicId = '', storyId = ''

  // 1. Register
  await test('Register user', async () => {
    const res = await fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'Test1234!', name: 'Test User' }),
    })
    if (!res.access_token && !res.id) throw new Error('No token or id in response: ' + JSON.stringify(res))
  })

  // 2. Login
  await test('Login', async () => {
    const res = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'Test1234!' }),
    })
    token = res.access_token || res.token
    if (!token) throw new Error('No token: ' + JSON.stringify(res))
  })

  // 3. Create project
  await test('Create project', async () => {
    const res = await fetchJson('/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'Remote Test', slug: 'remote-test-' + Date.now(), type: 'NEXTJS' }),
    })
    projectId = res.id
    if (!projectId) throw new Error('No project ID')
  })

  // 4. List projects
  await test('List projects', async () => {
    const res = await fetchJson('/projects')
    if (!Array.isArray(res)) throw new Error('Expected array')
  })

  // 5. Create epic
  await test('Create epic', async () => {
    const res = await fetchJson('/epics', {
      method: 'POST',
      body: JSON.stringify({ projectId, number: 1, title: 'Remote Epic' }),
    })
    epicId = res.id
    if (!epicId) throw new Error('No epic ID')
  })

  // 6. Create story
  await test('Create story', async () => {
    const res = await fetchJson('/stories', {
      method: 'POST',
      body: JSON.stringify({ epicId, number: 1, title: 'Remote Story' }),
    })
    storyId = res.id
    if (!storyId) throw new Error('No story ID')
  })

  // 7. Read back
  await test('Read project', async () => {
    const res = await fetchJson(`/projects/${projectId}`)
    if (res.id !== projectId) throw new Error('ID mismatch')
  })

  // 8. Cleanup
  await test('Delete project', async () => {
    await fetchJson(`/projects/${projectId}`, { method: 'DELETE' })
  })

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
