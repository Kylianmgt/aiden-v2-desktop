// AIDEN v2 Desktop - GitHub Service

import { Octokit } from '@octokit/rest'
import { getDatabaseClient } from './database'
import { execSync } from 'child_process'

export class GitHubService {
  private octokit: Octokit | null = null

  private async getOctokit(): Promise<Octokit> {
    if (this.octokit) return this.octokit

    const db = getDatabaseClient()
    const settings = db ? await db.userSettings.findFirst() : null
    const token = settings?.githubAccessToken

    if (!token) throw new Error('GitHub access token not configured. Set it in Settings.')

    this.octokit = new Octokit({ auth: token })
    return this.octokit
  }

  resetClient() {
    this.octokit = null
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      const ok = new Octokit({ auth: token })
      await ok.rest.users.getAuthenticated()
      this.octokit = ok

      // Persist token
      const db = getDatabaseClient()
      if (db) {
        const settings = await db.userSettings.findFirst()
        if (settings) {
          await db.userSettings.update({
            where: { id: settings.id },
            data: { githubAccessToken: token },
          })
        }
      }
      return true
    } catch {
      return false
    }
  }

  async getUser() {
    const ok = await this.getOctokit()
    const { data } = await ok.rest.users.getAuthenticated()
    return {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
    }
  }

  async listRepos() {
    const ok = await this.getOctokit()
    const { data } = await ok.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })
    return data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      html_url: r.html_url,
      clone_url: r.clone_url || '',
      default_branch: r.default_branch || 'main',
      updated_at: r.updated_at || '',
    }))
  }

  async listBranches(owner: string, repo: string) {
    const ok = await this.getOctokit()
    const { data } = await ok.rest.repos.listBranches({ owner, repo, per_page: 100 })
    return data.map(b => b.name)
  }

  async clone(owner: string, repo: string, destPath: string, branch?: string) {
    // Get token for authenticated clone
    const db = getDatabaseClient()
    const settings = db ? await db.userSettings.findFirst() : null
    const token = settings?.githubAccessToken
    const url = token
      ? `https://x-access-token:${token}@github.com/${owner}/${repo}.git`
      : `https://github.com/${owner}/${repo}.git`

    const args = ['git', 'clone']
    if (branch) args.push('-b', branch)
    args.push(url, destPath)

    execSync(args.join(' '), { stdio: 'pipe' })
  }
}

export const githubService = new GitHubService()
