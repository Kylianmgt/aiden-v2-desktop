#!/usr/bin/env npx tsx
// AIDEN v2 - Local SQLite Database Test
// Proves the Prisma/SQLite data layer works standalone

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(__dirname, '../test-local.db')
const DATABASE_URL = `file:${DB_PATH}`

async function main() {
  // Cleanup any previous test DB
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH)

  console.log('=== AIDEN v2 Local DB Test ===\n')

  // 1. Push schema to create DB
  console.log('1. Creating SQLite database...')
  try {
    execSync(`npx prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss`, {
      env: { ...process.env, DATABASE_URL },
      stdio: 'pipe',
    })
    console.log('   PASS ✅ Database created\n')
  } catch (e: any) {
    console.log('   FAIL ❌ ' + e.message)
    process.exit(1)
  }

  const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } })
  await prisma.$connect()

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

  // 2. Create user
  console.log('2. CRUD Operations...')
  const user = await prisma.user.create({
    data: { id: 'test-user', email: 'test@test.com', name: 'Test User' },
  })

  // 3. Create project
  await test('Create project', async () => {
    const project = await prisma.project.create({
      data: { userId: user.id, name: 'Test Project', slug: 'test-project', type: 'NEXTJS' },
    })
    if (!project.id) throw new Error('No ID')
  })

  const project = await prisma.project.findFirst({ where: { userId: user.id } })

  // 4. Create epic
  await test('Create epic', async () => {
    const epic = await prisma.epic.create({
      data: { projectId: project!.id, number: 1, title: 'Test Epic' },
    })
    if (!epic.id) throw new Error('No ID')
  })

  const epic = await prisma.epic.findFirst({ where: { projectId: project!.id } })

  // 5. Create story
  await test('Create story', async () => {
    const story = await prisma.story.create({
      data: { epicId: epic!.id, number: 1, title: 'Test Story', complexity: 'MEDIUM' },
    })
    if (!story.id) throw new Error('No ID')
  })

  // 6. Read back
  await test('Read project with relations', async () => {
    const p = await prisma.project.findUnique({
      where: { id: project!.id },
      include: { epics: { include: { stories: true } } },
    })
    if (!p) throw new Error('Not found')
    if (p.epics.length !== 1) throw new Error('Expected 1 epic')
    if (p.epics[0].stories.length !== 1) throw new Error('Expected 1 story')
  })

  // 7. Update
  await test('Update story status', async () => {
    const story = await prisma.story.findFirst()
    const updated = await prisma.story.update({
      where: { id: story!.id },
      data: { status: 'IN_PROGRESS' },
    })
    if (updated.status !== 'IN_PROGRESS') throw new Error('Status not updated')
  })

  // 8. Delete (cascade)
  await test('Delete project (cascades)', async () => {
    await prisma.project.delete({ where: { id: project!.id } })
    const epics = await prisma.epic.findMany()
    if (epics.length !== 0) throw new Error('Epics not cascaded')
    const stories = await prisma.story.findMany()
    if (stories.length !== 0) throw new Error('Stories not cascaded')
  })

  await prisma.$disconnect()

  // Cleanup
  fs.unlinkSync(DB_PATH)

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
