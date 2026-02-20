// AIDEN v2 Desktop - Filesystem IPC Handlers

import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

export function registerFilesystemHandlers(): void {
  ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
    return fs.promises.readFile(filePath, 'utf-8')
  })

  ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.writeFile(filePath, content, 'utf-8')
  })

  ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    return entries.map((entry) => ({
      name: entry.name,
      path: path.join(dirPath, entry.name),
      isDirectory: entry.isDirectory(),
    }))
  })

  ipcMain.handle('fs:exists', async (_event, p: string) => {
    return fs.existsSync(p)
  })

  ipcMain.handle('fs:mkdir', async (_event, dirPath: string, recursive?: boolean) => {
    await fs.promises.mkdir(dirPath, { recursive: recursive ?? true })
  })

  ipcMain.handle('fs:remove', async (_event, p: string) => {
    await fs.promises.rm(p, { recursive: true, force: true })
  })

  ipcMain.handle('fs:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
}
