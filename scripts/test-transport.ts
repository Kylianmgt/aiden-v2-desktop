#!/usr/bin/env npx tsx
// AIDEN v2 - Transport Middleware E2E Test
// Tests the transport abstraction layer against the NestJS server

const BASE_URL = process.env.AIDEN_SERVER_URL || 'http://localhost:3000'

async function main() {
  console.log('=== AIDEN v2 Transport Middleware E2E Test ===')
  console.log(`Server: ${BASE_URL}\n`)

  // Check server
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) })
  } catch {
    console.log('⚠️  Server not reachable. Skipping transport E2E test.')
    console.log('   Start NestJS server at ' + BASE_URL)
    process.exit(0)
  }

  // Import remote transport (dynamic to avoid bundling issues)
  // We test the transport factory creates a remote transport and can call APIs
  const { createRemoteTransport } = await import('../src/lib/transport/remote-transport')

  const transport = createRemoteTransport(BASE_URL)
  let passed = 0, failed = 0

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn()
      console.log(`   PASS ✅ ${name}`)
      passed++
    } catch (e: any) {
      console.log(`   FAIL ❌ ${name}: ${e.message}`)
      failed++
    }
  }

  await test('Transport mode is remote', async () => {
    if (transport.getMode() !== 'remote') throw new Error(`Expected 'remote', got '${transport.getMode()}'`)
  })

  await test('Transport is connected', async () => {
    if (!transport.isConnected()) throw new Error('Not connected')
  })

  await test('transport.db.projects.list() calls server', async () => {
    // This will call GET /api/projects - may fail with 401 if auth required, but proves routing works
    try {
      const projects = await transport.db.projects.list()
      console.log(`     → Got ${(projects as any[]).length} projects`)
    } catch (e: any) {
      // 401/403 = routing works, just needs auth
      if (e.message.includes('401') || e.message.includes('403')) {
        console.log('     → Server requires auth (expected) - routing works')
        return
      }
      throw e
    }
  })

  await test('transport.auth.getCurrentUser() calls /api/auth/me', async () => {
    try {
      await transport.auth.getCurrentUser()
    } catch (e: any) {
      if (e.message.includes('401') || e.message.includes('403')) {
        console.log('     → Auth required (expected) - routing works')
        return
      }
      throw e
    }
  })

  await test('All database adapters exist', async () => {
    const db = transport.db
    const adapters = ['projects', 'epics', 'stories', 'specs', 'activities', 'userSettings']
    for (const a of adapters) {
      if (!(a in db)) throw new Error(`Missing adapter: ${a}`)
    }
  })

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
