// AIDEN v2 Desktop - Database Service (SQLite via Prisma)

import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { loadConfig } from '../config'

let prismaClient: PrismaClient | null = null

const LOCAL_USER_ID = 'local-demo-user'
const LOCAL_USER_EMAIL = 'demo@aiden.dev'

export async function initializeDatabase(): Promise<void> {
  const config = loadConfig()
  const dbPath = config.databasePath || path.join(process.cwd(), 'aiden-local.db')
  const databaseUrl = `file:${dbPath}`
  const isFirstRun = !fs.existsSync(dbPath)

  console.log('[Database] SQLite at:', dbPath)

  // Set env for Prisma
  process.env.DATABASE_URL = databaseUrl

  if (isFirstRun) {
    console.log('[Database] First run, creating schema...')
    try {
      const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma')
      execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'inherit',
      })
    } catch (error) {
      console.error('[Database] Schema creation failed:', error)
      throw error
    }
  }

  prismaClient = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  await prismaClient.$connect()
  console.log('[Database] Connected')

  if (isFirstRun) {
    await ensureLocalUser()
  }
}

export function getDatabaseClient(): PrismaClient | null {
  return prismaClient
}

export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect()
    prismaClient = null
  }
}

async function ensureLocalUser(): Promise<void> {
  const db = getDatabaseClient()
  if (!db) return

  let user = await db.user.findUnique({ where: { id: LOCAL_USER_ID } })
  if (!user) {
    user = await db.user.create({
      data: { id: LOCAL_USER_ID, email: LOCAL_USER_EMAIL, name: 'Demo User' },
    })
    console.log('[Database] Created local user')
  }

  const settings = await db.userSettings.findUnique({ where: { userId: LOCAL_USER_ID } })
  if (!settings) {
    await db.userSettings.create({
      data: { userId: LOCAL_USER_ID, autoStartRalph: true, autoGeneratePrd: true },
    })
  }
}

export function getLocalUserId(): string {
  return LOCAL_USER_ID
}
