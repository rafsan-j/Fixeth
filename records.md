## Planning
1. Project draft
2. Features to keep
3. Finalizing plan
    - tech stack to use
    - system architecture

## Execution

### Current Source of Truth
- SQL tables, Supabase Auth, and finalized UI merged into root Next.js App Router are complete.
- **Auth is Supabase Auth only** (OAuth + session cookies via `@supabase/ssr`). There is no NextAuth in this project.
- All app screens live under `components/screens/` with bookmarkable routes (`/dashboard`, `/learn/[lessonId]`, etc.).
- **`frontend/` is a Git submodule** (reference UI). Root Next.js ports selected screens from it; submodule is not deployed separately.
- **Production:** [https://fixeth.vercel.app](https://fixeth.vercel.app) (Vercel project `fixeth`, team `shafin2954s-projects`).
- Supabase syncs auth user profile, onboarding completion, preferred language, theme, and local preference blobs (editor/AI prefs in `localStorage` + partial DB sync).
- **Course content in the app UI** still uses static `CORE_MODULES` in `lib/course/constants.ts`. DB tables (`tracks`, `modules`, `lessons`) exist and `/tracks` reads published tracks via `getAllTracks()`, but dashboard/learn flows are not wired to Supabase curriculum yet.
 - BYOA is allowed per `AGENTS.md` — learner API keys must be stored only in browser `localStorage` and never sent to Fixeth servers. Payment processing remains out of scope for now.

### Frontend merge — done vs not done

| Area | Status |
|------|--------|
| Copy screens, themes, i18n map, UI types into root | Done |
| App Router URLs + `(app)` / `(onboarding)` route groups | Done |
| `AppThemeProvider`, `CourseProvider`, `AppChrome`, `WorkspaceLayout` | Done |
| `middleware.ts` + `/auth/callback` (Supabase OAuth) | Done (redirect loop fixed — see below) |
| Remove `frontend/` submodule + `FinalizedFrontendShell` | Done (submodule kept as design reference) |
| Port latest `frontend` UI deltas into `components/screens/*` | Done (2026-05-29, last 5 submodule commits) |
| Login/signup UI matches `LoginRegister.tsx` + Google/GitHub OAuth | Done |
| OAuth session persistence (`/auth/callback` cookie fix) | Done |
| `next-intl` instead of `lib/i18n/messages.ts` | Not done |
| Dashboard/lesson data from Supabase queries | Not done |
| `Analytics.tsx` screen + `/analytics` route | Not done |
| Public `/profile/[username]`, `/verify/[hash]` pages | Not done |
| Curriculum Agent after onboarding | Not done |
| BYOA badge/copy removal in UI | Not done |
| Docs: `onboarding.md`, `copilot-instructions.md`, `metaprompt.md` structure | Not fully updated |

### Phase 1: SQL Foundation ✅
**Completed:**
- ✅ Supabase PostgreSQL schema tables
- ✅ pgvector extension and `transcript_chunks` vector table
- ✅ RLS planned for user-scoped tables

**Still verify after clean rerun:**
- [ ] `match_transcript_chunks` RPC exists
- [ ] `get_concept_path` RPC exists
- [ ] RLS policies exist for `enrollments`, `learner_mastery`, `progress`, `quiz_results`, and `submissions`

### Phase 2: Auth ✅
**Completed:**
- ✅ Supabase Auth selected as the auth system
- ✅ GitHub OAuth configured (Google + GitHub on prod; redirect URLs in Supabase)
- ✅ Login/signup flow uses Supabase OAuth + email/password form
- ✅ `components/auth/login-register-screen.tsx` (ported from submodule `LoginRegister.tsx`)
- ✅ Production OAuth callback sets session cookies on redirect response (`app/auth/callback/route.ts`)

**Still verify:**
- [x] Auth callback → `/onboarding` or `/dashboard` based on `users.onboarding_complete`
- [ ] User profile row creation/sync works reliably with the new `users` schema (test fresh OAuth user end-to-end)
- [x] `users` RLS migration added (`20260528_users_rls.sql`) — must be applied in Supabase SQL Editor if not already

### Phase 3: i18n + Theme System (Partial)
- [x] Finalized frontend local English/Bengali translation map
- [ ] `next-intl` wiring
- [x] Language toggle persisted to `users.preferred_language`
- [x] Finalized frontend dark/light theme state
- [x] Theme toggle persisted to `users.preferred_theme`

### Phase 4: App UI Shell ✅ (merged into root Next.js)
**Completed:**
- ✅ `/dashboard`, `/learn/[lessonId]`, `/notebook`, etc. render migrated `components/screens/*`
- ✅ `/onboarding` is a dedicated route (`app/(onboarding)/onboarding`)
- ✅ `/` redirects to `/dashboard`
- ✅ `middleware.ts` protects app routes; Supabase session via `@supabase/ssr`
- ✅ Sign out uses Supabase Auth and returns to `/login`

**Still refine:**
- [ ] Remove or replace BYOA visual references to match `AGENTS.md`
- [ ] Confirm mobile nav behavior from the finalized UI

### Phase 5: Onboarding (Partial)
- [x] 5-step finalized onboarding flow mounted
- [x] Goal and experience collection
- [x] Track selection
- [x] Diagnostic assessment
- [x] Onboarding completion persisted to Supabase `users.onboarding_complete`
- [ ] Curriculum Agent integration after onboarding

### Phase 6: Dashboard (Partial)
- [x] Submodule dashboard UI: progress from modules, assessment card, track rows, `ContentTemplates`
- [x] Codespace editor prefs (theme, font, keymap) from profile settings
- [x] Profile settings 5-tab layout (identity, codespace, mentor, credentials, system/data)
- [ ] Wire dashboard modules/progress from Supabase `enrollments` + `progress` (still `CORE_MODULES` mock)
- [ ] Continue learning card linked to `enrollments.current_lesson_id`
- [ ] Track cards from live Supabase data on dashboard
- [ ] Job market feed
- [ ] Mentor prompt panel

### Phase 7: Guided Video Workspace
- [ ] 3-column lesson layout
- [ ] YouTube IFrame player
- [ ] Notes tab
- [ ] Transcript tab
- [ ] Chat with Video tab
- [ ] Practice tab

### Phase 8: Video Timestamp Intelligence
- [ ] Embed learner query
- [ ] Query `match_transcript_chunks`
- [ ] Return timestamped source chunks
- [ ] Seek video from AI response
- [ ] Show timestamp badge after seek

### Phase 9: Transcript + Subtitle Pipeline
- [ ] YouTube captions fetch
- [ ] Whisper fallback
- [ ] Chunking and embeddings insert
- [ ] Bengali GPT-4o translation
- [ ] Quality gate
- [ ] VTT upload to Supabase Storage
- [ ] Subtitle overlay polling every 250ms

### Phase 10: Curriculum Agent
- [ ] Seed Data Science concepts
- [ ] Seed concept edges
- [ ] Traverse graph with `get_concept_path`
- [ ] Build adaptive path
- [ ] Persist `adaptive_paths`

### Phase 11: Tutor Agent
- [ ] RAG-grounded lesson answers
- [ ] Bengali/English response handling
- [ ] Timestamp action selection
- [ ] Quiz question generation
- [ ] Source chunk reporting

### Phase 12: Quiz + Assessment
- [ ] Quiz item loader
- [ ] Quiz result persistence
- [ ] Mastery score updates
- [ ] Code assessment path
- [ ] Assessment Agent feedback

### Phase 13: Submissions
- [ ] Submission list view
- [ ] New submission upload to Supabase Storage
- [ ] Submission detail view
- [ ] Rubric tab
- [ ] AI feedback tab
- [ ] Peer review tab

### Phase 14: AI Mentor
- [ ] Session history
- [ ] Level selector
- [ ] Context pills
- [ ] Quick prompts
- [ ] Voice input
- [ ] Markdown/code rendering

### Phase 15: Notebook
- [ ] JupyterLite iframe
- [ ] Notebook toolbar
- [ ] Theme sync
- [ ] Library install modal

### Phase 16: Code Space
- [ ] GitHub repo listing
- [ ] Starter template list
- [ ] Codespace launch state machine
- [ ] Open/stop Codespace actions
- [ ] Alternative coding services grid

### Phase 17: Tools & Resources
- [ ] Indeed/job market status
- [ ] Cloud service OAuth connect buttons
- [ ] Resource library
- [ ] Track-based resource filtering

### Phase 18: Portfolio + Certificates
- [ ] Public profile page
- [ ] Certificate verification page
- [ ] Certificate PDF generation
- [ ] LinkedIn certificate link
- [ ] QR code verification

### Phase 19: Job Market Agent
- [ ] Playwright scraper
- [ ] Weekly scheduled job
- [ ] Skill trend persistence
- [ ] Admin review status flow

## 2026-05-28 — redirect loop fix

### Problem
After OAuth login (including brand-new users), browser showed `ERR_TOO_MANY_REDIRECTS`.

### Root cause
`middleware.ts` treated `/onboarding` as a normal protected app route (`isProtectedApp`). For users with `onboarding_complete !== true`, the middleware redirected **every** protected route to `/onboarding` — including when the user was **already** on `/onboarding`. That produced an infinite redirect to the same URL.

Secondary issue: `/login` and `/signup` client effects always sent existing sessions to `/dashboard`, causing an extra hop (`/dashboard` → `/onboarding`) before the loop above.

### Fix
- Exclude `/onboarding` from `isProtectedApp`; only redirect incomplete users from true app routes (dashboard, learn, etc.).
- When a signed-in user hits `/login` or `/signup`, middleware sends them to `/onboarding` or `/dashboard` based on profile (not always `/dashboard`).
- Align login/signup `useEffect` session checks with the same onboarding flag.

### Stuck after onboarding (symptom)
User finishes onboarding UI but never reaches `/dashboard` (stays on `/onboarding` or bounces back).

### Root cause
1. **`users` table had no RLS policies** in migrations. If RLS was enabled in the Supabase dashboard without policies, **SELECT/UPDATE fail silently** (0 rows).
2. Postgres RLS: **UPDATE requires a SELECT policy** on the same row — without it, `onboarding_complete = true` never persists.
3. `completeUserOnboarding` used `.update()` only and **did not check errors**, so the UI navigated to `/dashboard` even when the DB write failed; middleware then sent the user back to `/onboarding`.

### Fix (code + migration)
- Added [`supabase/migrations/20260528_users_rls.sql`](supabase/migrations/20260528_users_rls.sql): `SELECT` / `INSERT` / `UPDATE` policies for `auth.uid() = id` on `users`.
- `completeUserOnboarding` now **upserts** the profile (with email), verifies `onboarding_complete`, and throws on failure.
- Onboarding UI shows a red error banner if save fails.

### What you must run in Supabase
1. Open **Supabase Dashboard → SQL Editor**.
2. Paste and run the contents of `supabase/migrations/20260528_users_rls.sql` (or run `npx supabase db push` if using local CLI linked to the project).
3. In **Table Editor → users**, confirm your row exists with `id` = your Auth user UUID and `onboarding_complete` = `true` after finishing onboarding.
4. If a test row is stuck at `false`, set `onboarding_complete` to `true` manually once, or delete the row and sign in again.

### Open questions / risks
- Home `/` still redirects to `/dashboard`; middleware then sends incomplete users to `/onboarding` (two hops, acceptable).

## 2026-05-28 (continued)

### Done
- Merged Vite `frontend/` submodule into root Next.js: `components/screens/`, `lib/ui/themes.ts`, `lib/i18n/messages.ts`, `types/ui.ts`.
- Added App Router route groups `(app)` and `(onboarding)` with real URLs and `middleware.ts` auth/onboarding guards.
- Replaced `FinalizedFrontendShell` with `AppAuthShell`, `AppThemeProvider`, `CourseProvider`, `AppChrome`, `WorkspaceLayout`.
- Added `/auth/callback` OAuth handler; consolidated Supabase client on `@/lib/supabase/client`.
- Removed `frontend/` submodule, old dashboard shell components, and `utils/supabase/`.

### Verified
- `npm run build`

## 2026-05-28

### Done
- Mounted finalized `frontend/` UI inside the Next.js app through `components/finalized-frontend-shell.tsx` (superseded by merge above).
- Replaced the old `/dashboard` page with the finalized frontend shell.
- Added `/onboarding` route so Supabase signup redirects land on the finalized onboarding flow.
- Redirected `/` to `/dashboard`.
- Wired Supabase Auth session loading, profile row upsert, onboarding completion, language/theme persistence, and sign out.
- Fixed small frontend TypeScript blockers needed for Next build compatibility.
- Excluded the generated `frontend/` submodule from root ESLint while keeping imported code covered by TypeScript/build.

### Verified
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

### Next
- Run the clean Supabase schema and verify the `users` RLS policy allows profile upsert/update.
- Replace static dashboard/course data with queries from `lib/supabase/queries/`.
- Remove BYOA UI references or convert them to the approved platform-AI flow.
- Start wiring onboarding output to Curriculum Agent path generation.

### Follow-up Cleanup
- Confirmed `/login` and `/signup` are active routes used by the Supabase auth flow.
- Confirmed `components/lesson/lesson-list.tsx` is not currently mounted by the finalized frontend shell, but it is still part of the root codebase and lint scope.
- Kept the auth route lint fixes, old component lint fix, `i18n.ts` typing fix, and plan document cleanup as necessary project hygiene.

## 2026-05-29 — Vercel deploy, auth UI, frontend submodule sync

### Done
- **Vercel:** Deployed root Next.js to production ([fixeth.vercel.app](https://fixeth.vercel.app)). Env vars on Vercel: `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_APP_URL`, optional AI keys.
- **Auth fix:** OAuth callback attaches Supabase session cookies to the redirect response (fixes “returns to login after Google/GitHub”).
- **Auth UI:** `LoginRegister`-style screen at `/login` and `/signup` with Sign In / Sign Up tabs, email form, Google + GitHub buttons (`components/auth/login-register-screen.tsx`).
- **Frontend submodule sync** (commits `3ab2811..ce6249c`, 5 commits): ported into root without editing `frontend/`:
  - `Dashboard.tsx`, `ContentTemplates.tsx` (new), `Codespace.tsx`, `ProfileSettings.tsx`
  - `types/ui.ts` extended (`UserEvaluation`, `UserProfile`, `UserPreferences` with `editor` + `ai`)
  - `app-theme-provider.tsx` defaults + `normalizePreferences` for new prefs
  - Dashboard/codespace/profile pages wired to new props
- **Build:** `tsconfig.json` excludes `frontend/` from Next.js typecheck; `npm run build` passes.

### Left to do (near term)
- [ ] Pin git submodule `frontend` to `ce6249c` in root repo (`git add frontend`) when ready to commit
- [ ] Wire `CourseProvider` / dashboard / learn from `lib/supabase/queries/tracks.ts` + `lessons.ts` instead of `CORE_MODULES`
- [ ] Onboarding: create `enrollments` row when user picks a track; set `current_lesson_id`
- [ ] Persist assessment `evaluation` to DB or `localStorage` consistently after onboarding
- [ ] Port `Analytics.tsx` + add `/analytics` route (updated in submodule, not in root yet)
- [ ] Align `types/index.ts` `Track` fields with DB (`title_en` vs `title`) for `/tracks` page
- [ ] Apply / verify all Supabase migrations (`20260527_init_schema.sql`, `20260528_users_rls.sql`)
- [ ] Remove BYOA UI copy per `AGENTS.md`
- [ ] `next-intl` migration from `lib/i18n/messages.ts`

### How to register courses / tracks (see also user question below)
Curriculum lives in Supabase tables `tracks` → `modules` → `lessons`. There is **no admin UI yet**; register content via SQL (or future seed script). Published tracks appear on `/tracks` via `getAllTracks()`. Learner enrollment is table `enrollments` (not wired from onboarding yet).


by sh54:

After finishing up basic ui, we did:
  1. remove frontend submodule and use root repo as the next js app ui

  2. updated lesson table with youtube video links, and ids
  3. used those ids to create chunk, embedding for all of them. Automated this process using n8n. This pulls unprocessed lessons from the database, loads the video from youtube using pytubefix and transcribes using local whisper. then creates embedding (dim 768) using ollama nomic-embed-text

  4. Now we are trying to use those embedding to implement chat with ai and timestamp mapping

---

## Session 2026-05-30 — Video intelligence, real Notebook & GitHub Codespace

### Supabase wiring fixed
- Real curriculum/auth/enrollment/progress data lives in project `oxfynuytsnifqqhbmpcv`.
  The v0-connected integration (`nrahjflthceovpulydlc`) is EMPTY; its injected
  `NEXT_PUBLIC_SUPABASE_URL/KEY` were pointing the app at the wrong project.
- New `lib/supabase/config.ts` is the single source of truth. It defaults to the
  data project and only honors `NEXT_PUBLIC_SUPABASE_DATA_URL` / `_DATA_KEY`
  overrides (NOT the generic vars). `client.ts`, `server.ts`, `middleware.ts`,
  and `app/auth/callback/route.ts` all import from it.

### Course provider ↔ live data (already in place, verified)
- `course-provider.tsx` fetches real modules/lessons; `markLessonComplete()`
  upserts `progress` and recomputes `enrollments.progress_percent`. Wired to the
  GuidedVideo "Mark Complete" button.

### Video intelligence (NEW)
- `lib/supabase/queries/transcript.ts` — fetches `transcript_chunks` per lesson.
- `lib/ai/byoa.ts` — client-side BYOA LLM (Gemini REST + Ollama) using the user's
  own key from `preferences.ai`. Zero server inference cost.
- `lib/ai/video-chat.ts` — keyword retrieval over transcript, prompt building,
  and timestamp-chip parsing of answers.
- `GuidedVideo.tsx` — Transcript tab now renders real chunks with live highlight
  of the current segment; clicking a line seeks the player. Chat-with-Video calls
  the BYOA model with retrieved transcript context; answer timestamps become
  clickable jump chips. Progress bar is real (current/duration, click to seek).
- `youtube-player.tsx` — added `getDuration()` to the handle + `onReady` wiring.

### Notebook — real Python (NEW)
- `lib/notebook/pyodide.ts` — boots Pyodide (CPython in WASM) from CDN; runs cells,
  auto-loads imported packages (numpy/pandas), captures stdout/stderr.
- `lib/supabase/queries/notebooks.ts` — save/list/delete notebooks to the
  `notebooks` table (per-user) with localStorage mirror/fallback.
- `Notebook.tsx` — rewritten: notebook list sidebar, create/open/save/delete,
  add/move/delete cells, real per-cell execution, kernel status.

### Codespace — GitHub connected (NEW)
- `lib/github/client.ts` — BYOA Personal Access Token (browser-only) → list repos,
  list files, read file contents via GitHub REST.
- `Codespace.tsx` — rewritten: Connect-GitHub modal, repo list, loads real repo
  files into the editor, terminal `python` runs the real Pyodide interpreter.

### TODO / requires user action
- Run `supabase/migrations/20260602_notebooks_and_publish.sql` in the
  `oxfynuytsnifqqhbmpcv` SQL editor (this project is NOT reachable via v0's
  Supabase MCP). It publishes the Git course (`git-version-control`) and creates
  the `notebooks` table + RLS. Until then: Git course stays hidden and notebooks
  persist via localStorage only.
