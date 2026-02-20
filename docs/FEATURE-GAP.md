# AIDEN v1 → v2 Feature Gap Analysis

## v1 Features (104 API routes, grouped by domain)

### 1. AUTH & USER ✅ In v2
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/auth/[...nextauth]` | GET/POST | ✅ JWT auth (register/login/me) | ✅ Local (auto-user) |
| `/user/settings` | GET/PATCH | ❌ Missing | ❌ Missing |
| `/debug/auth` | GET | ❌ (debug, skip) | — |
| `/debug/projects` | GET | ❌ (debug, skip) | — |

**Gap:** User settings CRUD (AI provider, API keys, GitHub token, preferences, automation flags)

### 2. PROJECTS ✅ In v2
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/projects` | GET/POST | ✅ | ✅ |
| `/projects/[id]` | GET/PATCH/DELETE | ✅ | ✅ |
| `/projects/[id]/epics` | GET/POST | ✅ (via epics module) | ✅ |
| `/projects/[id]/stories` | GET/POST | ✅ (via stories module) | ✅ |
| `/projects/[id]/specs` | GET/POST | ✅ (via specs module) | ✅ |
| `/projects/[id]/settings` | GET/PATCH | ❌ Missing | ❌ Missing |
| `/projects/validate` | POST | ❌ Missing | ❌ Missing |

**Gap:** Project settings endpoint, project validation

### 3. PROJECT ANALYSIS ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/projects/[id]/analyze` | POST | ✅ (start) | ❌ Missing |
| `/projects/[id]/analysis` | GET | ✅ | ❌ Missing |

**Gap:** Desktop has no analysis module. Server has it but no AI execution (needs codebase analyzer logic)

### 4. ENHANCEMENT SESSIONS ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/projects/[id]/enhance` | POST/GET | ✅ | ❌ Missing |
| `/projects/[id]/enhance/prompt` | POST | ❌ Missing | ❌ Missing |
| `/projects/[id]/enhance/[sid]` | GET | ✅ | ❌ Missing |
| `/projects/[id]/enhance/[sid]/apply` | POST | ❌ Missing | ❌ Missing |

**Gap:** Enhanced prompt generation, apply enhancement to project. Desktop missing entirely.

### 5. EPICS ✅ In v2
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/epics/[id]/prd` | POST (stream) | ❌ Missing | ❌ Missing |

**Gap:** Epic PRD generation (AI streaming)

### 6. STORIES ⚠️ Major Gaps
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/stories/[id]` | GET/PATCH/DELETE | ✅ | ✅ |
| `/stories/[id]/reorder` | POST | ❌ Missing | ❌ Missing |
| `/stories/[id]/prd` | GET/POST (stream) | ❌ Missing | ❌ Missing |
| `/stories/[id]/prd/refine` | POST (stream) | ❌ Missing | ❌ Missing |
| `/stories/[id]/specs/generate` | POST (stream) | ❌ Missing | ❌ Missing |
| `/stories/[id]/ralph` | GET/POST/PATCH | ❌ Missing | ❌ Missing |
| `/stories/[id]/git` | GET/POST/PATCH | ❌ Missing | ❌ Missing |
| `/stories/[id]/enhance` | POST/PATCH | ❌ Missing | ❌ Missing |

**Gap:** Story reorder, PRD generation/refinement, spec generation, RALPH (AI agent for stories), git integration per story, story enhancement. These are CORE features.

### 7. SPECS ✅ In v2
Basic CRUD covered. No gaps for data operations.

### 8. AGENTS ⚠️ Major Gaps
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/agents` | GET/POST | ✅ (GET only, no spawn) | ❌ Missing |
| `/agents/[id]` | GET/DELETE | ✅ (GET + status PATCH) | ❌ Missing |
| `/agents/[id]/stream` | GET (SSE) | ❌ Missing | ❌ Missing |

**Gap:** Agent spawning, agent streaming (SSE for live progress), agent cancellation. Desktop has transport interface but no actual agent runner.

### 9. CHAT SYSTEM ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/chat/sessions` | GET/POST | ✅ | ❌ Missing |
| `/chat/sessions/[id]` | GET | ✅ | ❌ Missing |
| `/chat/sessions/[id]/message` | POST (stream) | ❌ Missing (no AI) | ❌ Missing |
| `/chat/sessions/[id]/artifacts/[id]/apply` | POST | ❌ Missing | ❌ Missing |
| `/chat/backlog` | POST (stream) | ❌ Missing | ❌ Missing |
| `/chat/story` | POST (stream) | ❌ Missing | ❌ Missing |
| `/chat/story/sessions` | GET/POST | ❌ Missing | ❌ Missing |
| `/chat/story/sessions/[id]` | GET | ❌ Missing | ❌ Missing |
| `/chat/story/sessions/[id]/messages` | GET | ❌ Missing | ❌ Missing |

**Gap:** All AI-powered chat (message streaming, backlog chat, story chat). Chat artifact application. Story-specific chat sessions.

### 10. COWORKER ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/coworker/conversations` | GET/POST | ✅ | ❌ Missing |
| `/coworker/chat` | POST (stream) | ❌ Missing (no AI) | ❌ Missing |
| `/coworker/chat/clear` | POST | ❌ Missing | ❌ Missing |
| `/coworker/execute-tool` | POST | ❌ Missing | ❌ Missing |

**Gap:** AI chat streaming, chat clearing, tool execution (coworker can execute tools)

### 11. BMAD METHOD ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/bmad/generate` | POST (stream) | ❌ | ❌ |
| `/bmad/generate-all` | POST (stream) | ❌ | ❌ |
| `/bmad/generate-epics` | POST | ❌ | ❌ |
| `/bmad/analyze` | POST (stream) | ❌ | ❌ |
| `/bmad/review` | POST (stream) | ❌ | ❌ |
| `/bmad/refine-vision` | POST | ❌ | ❌ |
| `/bmad/refine-vision-iterative` | POST | ❌ | ❌ |

**Gap:** Entire BMAD (Brainstorm, Map, Architect, Design) methodology. 7 endpoints, all AI-powered streaming.

### 12. KANBAN AI ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/kanban/generate-epic` | POST | ❌ | ❌ |
| `/kanban/generate-story` | POST | ❌ | ❌ |
| `/kanban/batch-generate-stories` | POST | ❌ | ❌ |
| `/kanban/refine-content` | POST | ❌ | ❌ |

**Gap:** AI-powered epic/story generation, batch generation, content refinement.

### 13. PROMPTS ✅ In v2
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/prompts` | GET/POST | ✅ | ❌ Missing |
| `/prompts/[key]` | GET/PATCH/DELETE | ✅ | ❌ Missing |
| `/prompts/[key]/history` | GET/POST | ✅ | ❌ Missing |
| `/prompts/[key]/preview` | POST | ❌ Missing | ❌ Missing |
| `/prompts/ai-assist` | POST (stream) | ❌ Missing | ❌ Missing |
| `/prompts/export` | GET | ❌ Missing | ❌ Missing |
| `/prompts/import` | POST | ❌ Missing | ❌ Missing |

**Gap:** Prompt preview, AI-assisted prompt editing, import/export

### 14. FILESYSTEM ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/filesystem/browse` | GET | ❌ | ✅ (IPC) |
| `/filesystem/validate` | POST | ❌ | ❌ Missing |
| `/filesystem/validate-project` | POST | ❌ | ❌ Missing |
| `/filesystem/init` | POST | ❌ | ❌ Missing |

**Gap:** Project directory validation, filesystem initialization

### 15. GIT ⚠️ Partial
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/git/status` | GET | ❌ | ❌ Missing |
| `/git/init` | POST | ❌ | ❌ Missing |
| `/git/commits` | GET | ❌ | ❌ Missing |

**Gap:** Git status, init, commit history. Desktop has filesystem IPC but no git operations.

### 16. GITHUB ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/github/status` | GET | ❌ | ❌ |
| `/github/repos` | GET | ❌ | ❌ |
| `/github/repos/[owner]/[repo]` | GET | ❌ | ❌ |
| `/github/repos/[owner]/[repo]/branches` | GET | ❌ | ❌ |
| `/github/repos/[owner]/[repo]/tree` | GET | ❌ | ❌ |
| `/github/oauth` | GET | ❌ | ❌ |
| `/github/callback` | GET | ❌ | ❌ |
| `/github/disconnect` | POST | ❌ | ❌ |
| `/github/clone` | POST | ❌ | ❌ |

**Gap:** Entire GitHub integration (OAuth, repo browsing, branch listing, file tree, cloning)

### 17. SETUP/WIZARD ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/setup/generate-backlog` | POST | ❌ | ❌ |
| `/setup/refine-context` | POST | ❌ | ❌ |

**Gap:** Project setup wizard — AI-powered backlog generation, context refinement

### 18. DRAFTS ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/drafts` | GET/POST | ❌ | ❌ |
| `/drafts/[id]` | GET/PUT/DELETE | ❌ | ❌ |

**Gap:** Project draft auto-save during creation wizard

### 19. AI PROVIDER ❌ Missing
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/ai-provider` | GET/POST | ❌ | ❌ |

**Gap:** AI provider configuration and testing

### 20. V1 API (Orchestrator) ❌ Missing Entirely
| v1 Route | Method | v2 Server | v2 Desktop |
|----------|--------|-----------|------------|
| `/v1/auth/*` | Various | ❌ | ❌ |
| `/v1/projects/*` | Various | ❌ | ❌ |
| `/v1/stories/[id]/build/*` | Various | ❌ | ❌ |
| `/v1/orchestrator/*` | Various | ❌ | ❌ |
| `/v1/review/*` | Various | ❌ | ❌ |
| `/v1/tasks/*` | Various | ❌ | ❌ |
| `/v1/webhooks` | Various | ❌ | ❌ |

**Gap:** Entire v1 orchestrator API — story builds (sequential + parallel), build streaming, code review, security review, task management, webhooks

### 21. WAITLIST ❌ (Skip — not needed for v2)

### 22. ACTIVITY ✅ In v2

---

## Electron Services (v1 → v2 Desktop)

| v1 Service | Lines | v2 Desktop |
|-----------|-------|------------|
| `agent-manager.ts` | 668 | ❌ Stubbed only |
| `terminal-manager.ts` | 587 | ❌ Stubbed only |
| `database.ts` | 144 | ✅ Prisma SQLite |

**Gap:** Agent manager (spawn Claude Code CLI, manage sessions, stream output), Terminal manager (PTY spawning, session management)

---

## Transport Layer (v1 → v2 Desktop)

| v1 Adapter | v2 Desktop |
|-----------|------------|
| DatabaseAdapter | ✅ (local + remote) |
| EventAdapter | ⚠️ Partial (basic events) |
| AgentAdapter | ❌ Interface only, no implementation |
| TerminalAdapter | ❌ Stubbed |
| FilesystemAdapter | ✅ (IPC) |
| StreamAdapter | ⚠️ Interface only |
| AuthAdapter | ✅ (local auto-user) |
| MemoryAdapter | ❌ Missing entirely |

---

## Summary: What's Missing

### 🔴 Critical (Core functionality)
1. **AI Integration** — No AI calls anywhere (streaming, chat, generation)
2. **Agent System** — No agent spawning/management (the CORE feature)
3. **BMAD Method** — 7 endpoints, all AI-powered
4. **Story AI Features** — PRD gen, spec gen, RALPH, refinement
5. **Kanban AI** — Epic/story generation, batch generation
6. **Build System** — Story builds (v1 orchestrator), parallel builds, streaming

### 🟡 Important
7. **GitHub Integration** — OAuth, repo browsing, cloning (9 endpoints)
8. **Git Operations** — Status, init, commits, per-story git
9. **Setup Wizard** — Backlog generation, context refinement
10. **Coworker AI** — Chat streaming, tool execution
11. **Memory System** — Shared memory adapter (transport + IPC)
12. **User Settings** — AI provider config, preferences, API keys
13. **Chat AI** — Message streaming, story chat, backlog chat

### 🟢 Nice to Have
14. **Drafts** — Auto-save during wizard
15. **Prompt AI** — Preview, AI assist, import/export
16. **Enhancement Apply** — Apply suggestions to project
17. **Filesystem Validation** — Project directory validation

### By the Numbers
- **v1 total routes:** 104
- **v2 server covers:** ~35 routes (34%)
- **v2 desktop covers:** ~15 routes (14%)
- **Missing routes:** ~70 (67%)
- **Missing streaming/AI routes:** 17 (all missing)
- **Missing entire domains:** BMAD, Kanban AI, GitHub, Setup, Drafts, v1 Orchestrator
