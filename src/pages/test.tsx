// AIDEN v2 - Transport Test Page (Extended)

import { useState } from 'react'
import { useTransport } from '../lib/transport/context'
import type { Project } from '../lib/transport/types'

export function TestPage() {
  const { transport, mode, isReady, isElectron, error, switchMode } = useTransport()
  const [log, setLog] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [testDir, setTestDir] = useState('/tmp/test-repo')

  const addLog = (msg: string) => setLog((prev) => [...prev, `[${new Date().toISOString()}] ${msg}`])

  const runCoreTests = async () => {
    if (!transport) { addLog('ERROR: Transport not ready'); return }
    addLog(`Running core tests in ${mode} mode...`)
    const r: Record<string, unknown> = {}

    try {
      addLog('Test: Create project')
      const project = await transport.db.projects.create({
        userId: 'local-demo-user',
        name: 'Test Project',
        slug: 'test-project-' + Date.now(),
        description: 'Created by transport test',
        type: 'NEXTJS',
      })
      r.createdProject = project
      addLog(`✅ Project created: ${project.id}`)

      addLog('Test: List projects')
      const projects = await transport.db.projects.list()
      r.projects = projects
      addLog(`✅ Listed ${(projects as Project[]).length} projects`)

      addLog('Test: Create epic')
      const epic = await transport.db.epics.create({
        projectId: project.id,
        number: 1,
        title: 'Test Epic',
      })
      addLog(`✅ Epic created: ${epic.id}`)

      addLog('Test: Create story')
      const story = await transport.db.stories.create({
        epicId: epic.id,
        number: 1,
        title: 'Test Story',
        complexity: 'MEDIUM',
      })
      addLog(`✅ Story created: ${story.id}`)

      addLog('Test: Auth check')
      const user = await transport.auth.getCurrentUser()
      addLog(`✅ User: ${user?.name}`)

      // Settings
      addLog('Test: Settings')
      const settings = await transport.db.userSettings.get('local-demo-user')
      addLog(`✅ Settings: provider=${settings?.selectedAiProvider || 'none'}`)

      // Chat session
      addLog('Test: Chat session')
      try {
        const chatSession = await transport.db.chatSessions.create({
          userId: 'local-demo-user',
          projectId: project.id,
          type: 'general',
        })
        addLog(`✅ Chat session: ${chatSession.id}`)

        const msg = await transport.db.chatMessages.create({
          sessionId: chatSession.id,
          role: 'user',
          content: 'Hello test',
        })
        addLog(`✅ Chat message: ${msg.id}`)
      } catch (e: any) {
        addLog(`⚠️ Chat: ${e.message}`)
      }

      // Memory
      addLog('Test: Memory')
      try {
        const mem = await transport.db.projectMemory.create({
          projectId: project.id,
          type: 'pattern',
          category: 'architecture',
          title: 'Test Memory',
          content: 'This is a test memory entry',
          confidence: 0.9,
        })
        addLog(`✅ Memory created: ${mem.id}`)

        const stats = await transport.memory.getStats(project.id)
        addLog(`✅ Memory stats: ${stats.totalMemories} total`)
      } catch (e: any) {
        addLog(`⚠️ Memory: ${e.message}`)
      }

      // Cleanup
      addLog('Cleanup...')
      await transport.db.projects.delete(project.id)
      addLog('✅ All core tests passed!')
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : String(err)}`)
    }

    setResults(r)
  }

  const runGitTests = async () => {
    if (!transport) return
    addLog(`Running git tests on ${testDir}...`)
    try {
      const status = await transport.git.status(testDir)
      addLog(`✅ Git status: branch=${status.current}, clean=${status.isClean}, files=${status.files.length}`)

      const branch = await transport.git.branch(testDir)
      addLog(`✅ Branches: ${branch.all.join(', ')}`)

      const gitLog = await transport.git.log(testDir, 5)
      addLog(`✅ Log: ${gitLog.length} entries`)
      for (const e of gitLog.slice(0, 3)) {
        addLog(`   ${e.hash.slice(0, 7)} ${e.message}`)
      }
    } catch (e: any) {
      addLog(`❌ Git: ${e.message}`)
    }
  }

  const runAgentTest = async () => {
    if (!transport) return
    addLog('Testing agent (mock)...')
    try {
      const sessions = await transport.agent.list()
      addLog(`✅ Agent sessions: ${sessions.length}`)
    } catch (e: any) {
      addLog(`⚠️ Agent: ${e.message}`)
    }
  }

  const runStreamTest = async () => {
    if (!transport) return
    addLog('Testing stream...')
    try {
      const streamId = await transport.stream.start('test', { prompt: 'Hello' })
      addLog(`✅ Stream started: ${streamId}`)

      const unsub = transport.stream.onData(streamId, (event) => {
        addLog(`  Stream data: ${event.type} — ${event.content?.slice(0, 50)}`)
      })

      transport.stream.onDone(streamId, () => {
        addLog('✅ Stream done')
        unsub()
      })
    } catch (e: any) {
      addLog(`❌ Stream: ${e.message}`)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 18, marginBottom: 10 }}>AIDEN v2 Transport Test</h1>

      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {isReady ? '✅ Ready' : '⏳ Loading...'}
        {' | '}<strong>Mode:</strong> {mode || 'unknown'}
        {' | '}<strong>Electron:</strong> {isElectron ? 'Yes' : 'No'}
        {error && <span style={{ color: 'red' }}> | Error: {error.message}</span>}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={runCoreTests} disabled={!isReady} style={{ padding: '4px 12px' }}>
          Core Tests
        </button>
        <button onClick={runGitTests} disabled={!isReady} style={{ padding: '4px 12px' }}>
          Git Tests
        </button>
        <button onClick={runAgentTest} disabled={!isReady} style={{ padding: '4px 12px' }}>
          Agent Test
        </button>
        <button onClick={runStreamTest} disabled={!isReady} style={{ padding: '4px 12px' }}>
          Stream Test
        </button>
        <span style={{ padding: '4px 0' }}>|</span>
        <button onClick={() => switchMode('local')} style={{ padding: '4px 12px' }}>Local</button>
        <button onClick={() => switchMode('remote')} style={{ padding: '4px 12px' }}>Remote</button>
        <button onClick={() => switchMode('hybrid')} style={{ padding: '4px 12px' }}>Hybrid</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Git test dir: </label>
        <input value={testDir} onChange={e => setTestDir(e.target.value)} style={{ width: 300, padding: '2px 6px' }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>Log</h2>
        <pre style={{ background: '#111', color: '#0f0', padding: 10, maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
          {log.length ? log.join('\n') : 'Click a test button to start.'}
        </pre>
        <button onClick={() => setLog([])} style={{ padding: '2px 8px', marginTop: 4 }}>Clear Log</button>
      </div>

      <div>
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>Results</h2>
        <pre style={{ background: '#111', color: '#ccc', padding: 10, maxHeight: 300, overflow: 'auto', fontSize: 11 }}>
          {Object.keys(results).length ? JSON.stringify(results, null, 2) : 'No results yet.'}
        </pre>
      </div>
    </div>
  )
}
