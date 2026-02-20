// AIDEN v2 - Transport Test Page (raw JSON, no UI components)

import { useState, useEffect } from 'react'
import { useTransport } from '../lib/transport/context'
import type { Project, Epic, Story } from '../lib/transport/types'

export function TestPage() {
  const { transport, mode, isReady, isElectron, error, switchMode } = useTransport()
  const [log, setLog] = useState<string[]>([])
  const [results, setResults] = useState<Record<string, unknown>>({})

  const addLog = (msg: string) => setLog((prev) => [...prev, `[${new Date().toISOString()}] ${msg}`])

  const runTests = async () => {
    if (!transport) { addLog('ERROR: Transport not ready'); return }

    addLog(`Running tests in ${mode} mode...`)
    const r: Record<string, unknown> = {}

    try {
      // Test 1: Create project
      addLog('Test 1: Create project')
      const project = await transport.db.projects.create({
        userId: 'local-demo-user',
        name: 'Test Project',
        slug: 'test-project-' + Date.now(),
        description: 'Created by transport test',
        type: 'NEXTJS',
      })
      r.createdProject = project
      addLog(`✅ Project created: ${project.id}`)

      // Test 2: List projects
      addLog('Test 2: List projects')
      const projects = await transport.db.projects.list()
      r.projects = projects
      addLog(`✅ Listed ${(projects as Project[]).length} projects`)

      // Test 3: Create epic
      addLog('Test 3: Create epic')
      const epic = await transport.db.epics.create({
        projectId: project.id,
        number: 1,
        title: 'Test Epic',
        description: 'First epic',
      })
      r.createdEpic = epic
      addLog(`✅ Epic created: ${epic.id}`)

      // Test 4: Create story
      addLog('Test 4: Create story')
      const story = await transport.db.stories.create({
        epicId: epic.id,
        number: 1,
        title: 'Test Story',
        description: 'First story',
        complexity: 'MEDIUM',
      })
      r.createdStory = story
      addLog(`✅ Story created: ${story.id}`)

      // Test 5: List epics
      addLog('Test 5: List epics')
      const epics = await transport.db.epics.list(project.id)
      r.epics = epics
      addLog(`✅ Listed ${(epics as Epic[]).length} epics`)

      // Test 6: List stories
      addLog('Test 6: List stories')
      const stories = await transport.db.stories.list({ epicId: epic.id })
      r.stories = stories
      addLog(`✅ Listed ${(stories as Story[]).length} stories`)

      // Test 7: Update story
      addLog('Test 7: Update story')
      const updatedStory = await transport.db.stories.update(story.id, { status: 'IN_PROGRESS' })
      r.updatedStory = updatedStory
      addLog(`✅ Story updated: status=${updatedStory.status}`)

      // Test 8: Auth
      addLog('Test 8: Auth check')
      const user = await transport.auth.getCurrentUser()
      r.user = user
      addLog(`✅ User: ${user?.name} (${user?.email})`)

      // Test 9: Get project
      addLog('Test 9: Get project by ID')
      const fetchedProject = await transport.db.projects.get(project.id)
      r.fetchedProject = fetchedProject
      addLog(`✅ Fetched project: ${fetchedProject?.name}`)

      // Cleanup
      addLog('Cleanup: Deleting test data...')
      await transport.db.projects.delete(project.id)
      addLog('✅ Cleanup complete')

      addLog('🎉 All tests passed!')
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : String(err)}`)
      r.error = err instanceof Error ? err.message : String(err)
    }

    setResults(r)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 18, marginBottom: 10 }}>AIDEN v2 Transport Test</h1>

      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {isReady ? '✅ Ready' : '⏳ Loading...'}
        {' | '}
        <strong>Mode:</strong> {mode || 'unknown'}
        {' | '}
        <strong>Electron:</strong> {isElectron ? 'Yes' : 'No'}
        {error && <span style={{ color: 'red' }}> | Error: {error.message}</span>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={runTests} disabled={!isReady} style={{ marginRight: 8, padding: '4px 12px' }}>
          Run Tests
        </button>
        <button onClick={() => switchMode('local')} style={{ marginRight: 8, padding: '4px 12px' }}>
          Switch to Local
        </button>
        <button onClick={() => switchMode('remote')} style={{ marginRight: 8, padding: '4px 12px' }}>
          Switch to Remote
        </button>
        <button onClick={() => switchMode('hybrid')} style={{ padding: '4px 12px' }}>
          Switch to Hybrid
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>Log</h2>
        <pre style={{ background: '#111', padding: 10, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
          {log.length ? log.join('\n') : 'No log entries yet. Click "Run Tests".'}
        </pre>
      </div>

      <div>
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>Results (raw JSON)</h2>
        <pre style={{ background: '#111', padding: 10, maxHeight: 400, overflow: 'auto', fontSize: 11 }}>
          {Object.keys(results).length ? JSON.stringify(results, null, 2) : 'No results yet.'}
        </pre>
      </div>
    </div>
  )
}
