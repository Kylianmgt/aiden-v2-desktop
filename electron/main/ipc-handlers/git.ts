// AIDEN v2 Desktop - Git IPC Handlers

import { ipcMain } from 'electron'
import { gitService } from '../services/git'

export function registerGitHandlers(): void {
  ipcMain.handle('git:status', async (_event, workDir: string) => {
    return gitService.status(workDir)
  })

  ipcMain.handle('git:init', async (_event, workDir: string) => {
    return gitService.init(workDir)
  })

  ipcMain.handle('git:commit', async (_event, workDir: string, message: string) => {
    return gitService.commit(workDir, message)
  })

  ipcMain.handle('git:diff', async (_event, workDir: string, options?: { staged?: boolean }) => {
    return gitService.diff(workDir, options)
  })

  ipcMain.handle('git:log', async (_event, workDir: string, limit?: number) => {
    return gitService.log(workDir, limit)
  })

  ipcMain.handle('git:branch', async (_event, workDir: string) => {
    return gitService.branch(workDir)
  })

  ipcMain.handle('git:checkout', async (_event, workDir: string, branch: string, create?: boolean) => {
    return gitService.checkout(workDir, branch, create)
  })

  ipcMain.handle('git:push', async (_event, workDir: string, remote?: string, branch?: string) => {
    return gitService.push(workDir, remote, branch)
  })

  ipcMain.handle('git:pull', async (_event, workDir: string, remote?: string, branch?: string) => {
    return gitService.pull(workDir, remote, branch)
  })

  ipcMain.handle('git:add', async (_event, workDir: string, files: string[]) => {
    return gitService.add(workDir, files)
  })
}
