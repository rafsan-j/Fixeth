# AGENTS.md

## Project
Bengali-first adaptive LMS. Next.js 14 App Router + Supabase (single DB).
Competition: THE INFINITY AI BUILDFEST 2026 — EdTech track.

## Stack
- Framework: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Auth + DB + Storage: Supabase (single source of truth)
- Vector store: pgvector via Supabase (transcript_chunks table)
- Agents: lib/agents/ — Curriculum, Tutor, Assessment
- LLMs: Claude primary, GPT-4o for translation

## Conventions
- Server components by default. Add "use client" only when needed.
- DB access: lib/supabase/server.ts in RSC, lib/supabase/client.ts in client components
- All DB queries go in lib/supabase/queries/ — never inline
- Agent logic lives in lib/agents/ — API routes only call agents, no logic in route files
- Types: define in types/index.ts, import from there
- i18n: all user-facing strings via next-intl, keys in lib/i18n/en.json + bn.json

## Key Patterns
- RAG: embed query → pgvector cosine search → top 5 chunks → grounded prompt → LLM
- Concept graph: recursive CTE in lib/graph/traverse.ts
- Subtitle overlay: poll YouTube player every 250ms, match VTT cues
- API routes: validate with Zod, always return { data, error } shape

## Do NOT
- Write business logic inside app/api/ route files
- Use any DB other than Supabase
- Store API keys anywhere except .env.local
- Add payment processing — pricing page is static only
- Add BYOA — removed from scope
 - Do NOT
 - Write business logic inside app/api/ route files
 - Use any DB other than Supabase
 - Store API keys anywhere except .env.local
 - Add payment processing — pricing page is static only

 - BYOA: allowed — BYOA keys may be used by learners but must be stored only in browser localStorage and never sent to Fixeth servers. See `metaprompt.md` for BYOA security guidance and platform fallback details.

## Docs
- Full plan: plan.md
- Architecture: docs/ARCHITECTURE.md
- Prompts: docs/PROMPTS.md
- Data strategy: docs/DATA_STRATEGY.md

---

## Behavior Guidelines

### Think Before Coding
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so.
- If something is unclear, stop. Name what's confusing. Ask.

### Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it.

### Surgical Changes
- Don't improve adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Every changed line should trace directly to the request.

### Goal-Driven Execution
Transform tasks into verifiable goals before starting: