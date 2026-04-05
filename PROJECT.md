# Erdem — Personal Ideas & Philosophy Platform

## Vision

A personal website where ideas are living documents. Posts evolve through versions, AI agents analyze them from multiple perspectives, and a Summary Agent synthesizes the discourse. Every piece of metadata — which model was used, what prompt was given, when the analysis was generated — is transparent and preserved.

---

## Core Concepts

### 1. Versioned Writing

Every post is a **living document**. When an idea evolves, a new version is published — the old version remains accessible. This creates a transparent timeline of intellectual growth.

- Posts have versions: v1, v2, v3... each with a timestamp
- Versions are **immutable** once published — they cannot be edited
- Versions can be **soft-deleted**: the version slot remains in the timeline, but content is replaced with *"This content was removed by Erdem"*
- Readers can navigate between versions via a horizontal timeline strip

### 2. AI Agent Commentary System

AI agents are defined by **character README files** — markdown documents that describe the agent's personality, expertise, analytical framework, and perspective. These characters are model-agnostic: you pick a character + any supported AI model, and run the analysis.

**How it works:**
1. Define an agent character (e.g., "Economic Analyst", "Social Philosopher")
2. Write a character README describing how this agent thinks and analyzes
3. When running commentary on a post: select the agent character + choose a model (GPT-4o, Claude Sonnet, Gemini Pro, etc.)
4. The system composes the prompt from: character README + post content
5. The response is saved with full metadata: model used, exact prompts sent, token counts, generation date
6. A **Summary Agent** runs last, ingesting all other commentaries to produce: what the post argues, pros, cons, and gaps

**Why model-agnostic?** Future models will be more capable. The same character README run on a 2027 model may produce dramatically deeper analysis. The system preserves history so you can compare.

### 3. Content Categories

| Category | Purpose | Tagline |
|----------|---------|---------|
| **The Frontier** | Humanity-changing discoveries, turning points, what we need to find next | *"To be human is to look at a boundary and wonder what lies past it. The Frontier represents our refusal to ever stop exploring."* |
| **The Quest** | Meaning of life, personal journey, inner exploration | *"We send rockets to the stars to explore the outside world, but we each face an equally massive adventure inside our own minds."* |
| **The Synthesis** | Personal ideas distilled to their clearest form | *"A thought is only as powerful as it is clear. The Synthesis is where the fog is burned away."* |

### 4. References & Attachments

Each post version can have references: PDFs, images, video links. These are tied to the specific version, not the post — because different versions may reference different sources.

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | SSR/ISR, API routes, Vercel-native |
| Language | TypeScript | Type safety, long-term maintainability |
| Database | PostgreSQL via Supabase | Managed DB + Auth + Storage in one service |
| ORM | Drizzle ORM | Type-safe, lightweight, close to SQL |
| Styling | Tailwind CSS + shadcn/ui | Clean, rapid UI development |
| Auth | Supabase Auth | Single admin user, email/password |
| AI | Vercel AI SDK | Model-agnostic (OpenAI, Anthropic, Google, etc.) |
| File Storage | Supabase Storage | PDFs, images |
| Markdown | MDX via next-mdx-remote | Rich content rendering |
| Deployment | Vercel | Zero-config for Next.js |

### Database Schema

```
posts
├── id (UUID, PK)
├── slug (TEXT, UNIQUE)
├── title (TEXT)
├── category ('the-frontier' | 'the-quest' | 'the-synthesis')
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
├── is_published (BOOLEAN)
├── cover_image_url (TEXT, nullable)
├── tags (TEXT[])
└── sort_order (INTEGER)

post_versions
├── id (UUID, PK)
├── post_id (UUID, FK → posts)
├── version_number (INTEGER)
├── title (TEXT)
├── content_md (TEXT — markdown body)
├── summary (TEXT)
├── change_note (TEXT — what changed)
├── published_at (TIMESTAMPTZ)
├── is_deleted (BOOLEAN — soft-delete flag)
└── UNIQUE(post_id, version_number)

attachments
├── id (UUID, PK)
├── post_version_id (UUID, FK → post_versions)
├── type ('pdf' | 'image' | 'video_link')
├── url (TEXT)
├── label (TEXT)
├── sort_order (INTEGER)
└── created_at (TIMESTAMPTZ)

ai_agents (Character Definitions)
├── id (UUID, PK)
├── slug (TEXT, UNIQUE)
├── display_name (TEXT)
├── description (TEXT — short public description)
├── perspective (TEXT — e.g. "Economic Lens")
├── character_readme (TEXT — full character definition in markdown)
├── icon (TEXT)
├── is_active (BOOLEAN)
└── sort_order (INTEGER)

agent_runs (Each AI Execution)
├── id (UUID, PK)
├── post_version_id (UUID, FK → post_versions)
├── agent_id (UUID, FK → ai_agents)
├── model_provider (TEXT — 'openai', 'anthropic', 'google', etc.)
├── model_name (TEXT — 'gpt-4o', 'claude-sonnet-4-20250514', etc.)
├── character_readme_snapshot (TEXT — frozen copy of README used)
├── system_prompt (TEXT — the full system prompt sent)
├── user_prompt (TEXT — the full user prompt sent)
├── content_md (TEXT — the AI's response)
├── token_count_in (INTEGER)
├── token_count_out (INTEGER)
├── cost_usd (DECIMAL)
├── generated_at (TIMESTAMPTZ)
├── is_visible (BOOLEAN)
└── UNIQUE(post_version_id, agent_id)
```

### URL Structure

```
Public:
/                                    → Homepage (landing)
/the-frontier                        → Category listing
/the-frontier/[slug]                 → Latest version of post
/the-frontier/[slug]/v/[number]      → Specific version
/the-quest                           → Category listing
/the-quest/[slug]                    → Latest version
/the-synthesis                       → Category listing
/the-synthesis/[slug]                → Latest version

Admin (protected):
/admin                               → Dashboard
/admin/posts/new                     → Create post
/admin/posts/[id]                    → Edit post / create new version
/admin/posts/[id]/agents             → Run agents for this post
/admin/agents                        → Manage AI agent characters
```

### Key Architectural Decisions

1. **Versions are immutable** — Once published, content cannot be edited. Only soft-delete is allowed. Enforced at DB level with a Postgres trigger.

2. **AI agents are on-demand** — Not auto-triggered on publish. Admin clicks "Run Agents" to control costs and timing.

3. **ISR + on-demand revalidation** — Public pages are statically generated. When admin publishes or runs agents, `revalidatePath()` updates the page.

4. **Character READMEs are snapshotted** — When an agent runs, the current character README is frozen into `agent_runs.character_readme_snapshot`. This preserves exactly what produced the output, even if the README is later updated.

5. **Server Components by default** — Client Components only for interactive elements: markdown editor, agent runner buttons, login form.

---

## Admin Features

### Post Management
- Create new posts with title, slug, category, markdown content, summary, tags
- Publish new versions of existing posts (pre-filled with current content)
- Soft-delete versions (content replaced with removal notice)
- Upload and manage attachments per version

### AI Agent Management
- Create/edit agent characters via markdown README editor
- Pick model per agent when running (not hardcoded)
- Run individual agents or "Run All" on a post version
- View full execution history: which model, which prompt, which README version
- Toggle visibility of agent commentaries

### Authentication
- Single admin user (Erdem) via Supabase Auth (email/password)
- All `/admin/*` routes protected by Next.js middleware
- No public registration — account created manually in Supabase dashboard

---

## Implementation Phases

### Phase 1: Foundation
Next.js + TypeScript + Tailwind + shadcn/ui setup, Supabase project, Drizzle schema, auth middleware, admin login, minimal navbar, placeholder homepage, first Vercel deploy.

### Phase 2: Content System
Post CRUD, versioning workflow, soft-delete, public category pages with taglines, public post pages with markdown rendering, version timeline picker, file upload + attachments.

### Phase 3: AI Agent System
Agent character management (README editor), agent runner UI (pick model + character + run), run-agent core logic, run-all-agents orchestration, public commentary display (accordion cards), metadata transparency.

### Phase 4: Design & Polish
Typography, homepage design (Unit8-style hero), dark mode, responsive design, SEO, animations, 404 page.

### Phase 5: Hardening
Rate limiting, Zod validation, Supabase RLS policies, AI pipeline error handling, loading states, accessibility.
