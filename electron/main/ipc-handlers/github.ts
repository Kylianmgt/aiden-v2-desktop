// AIDEN v2 Desktop - GitHub IPC Handlers

import { ipcMain } from 'electron'
import { githubService } from '../services/github'

export function registerGitHubHandlers(): void {
  ipcMain.handle('github:authenticate', async (_event, token: string) => {
    return githubService.authenticate(token)
  })

  ipcMain.handle('github:user', async () => {
    return githubService.getUser()
  })

  ipcMain.handle('github:repos', async () => {
    return githubService.listRepos()
  })

  ipcMain.handle('github:branches', async (_event, owner: string, repo: string) => {
    return githubService.listBranches(owner, repo)
  })

  ipcMain.handle('github:clone', async (_event, owner: string, repo: string, path: string, branch?: string) => {
    return githubService.clone(owner, repo, path, branch)
  })
}
