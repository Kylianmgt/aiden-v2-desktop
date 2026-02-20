// AIDEN v2 Desktop - Git Service

import simpleGit, { SimpleGit, StatusResult } from 'simple-git'

export class GitService {
  private getGit(workDir: string): SimpleGit {
    return simpleGit(workDir)
  }

  async status(workDir: string) {
    const git = this.getGit(workDir)
    const s: StatusResult = await git.status()
    return {
      isClean: s.isClean(),
      current: s.current,
      tracking: s.tracking,
      ahead: s.ahead,
      behind: s.behind,
      files: s.files.map(f => ({
        path: f.path,
        index: f.index,
        working_dir: f.working_dir,
      })),
    }
  }

  async init(workDir: string) {
    await this.getGit(workDir).init()
  }

  async commit(workDir: string, message: string): Promise<string> {
    const result = await this.getGit(workDir).commit(message)
    return result.commit || ''
  }

  async diff(workDir: string, options?: { staged?: boolean }): Promise<string> {
    const git = this.getGit(workDir)
    return options?.staged ? git.diff(['--staged']) : git.diff()
  }

  async log(workDir: string, limit: number = 20) {
    const result = await this.getGit(workDir).log({ maxCount: limit })
    return result.all.map(e => ({
      hash: e.hash,
      date: e.date,
      message: e.message,
      author_name: e.author_name,
      author_email: e.author_email,
    }))
  }

  async branch(workDir: string) {
    const result = await this.getGit(workDir).branch()
    return {
      current: result.current,
      all: result.all,
      branches: result.branches as any,
    }
  }

  async checkout(workDir: string, branch: string, create?: boolean) {
    const git = this.getGit(workDir)
    if (create) {
      await git.checkoutLocalBranch(branch)
    } else {
      await git.checkout(branch)
    }
  }

  async push(workDir: string, remote?: string, branch?: string) {
    await this.getGit(workDir).push(remote || 'origin', branch)
  }

  async pull(workDir: string, remote?: string, branch?: string) {
    await this.getGit(workDir).pull(remote || 'origin', branch)
  }

  async add(workDir: string, files: string[]) {
    await this.getGit(workDir).add(files)
  }
}

export const gitService = new GitService()
