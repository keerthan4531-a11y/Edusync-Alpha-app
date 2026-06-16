Prompt for Claude Code — Build EduSync 4.0 by Merging Multiple Open-Source Repos

Copy everything below this line and give it to Claude Code as your starting instruction.


Project Goal

I want to build EduSync 4.0, a single Next.js + TypeScript application, by combining
features from a few open-source repositories into ONE unified codebase running on ONE
server with ONE database. Do NOT keep them as separate apps/microservices — everything
should live inside one Next.js (App Router) monorepo.

Reference Repos (clone these into a references/ folder first, study them, then port

the relevant code into the new unified app — do not just dump their package.json or run
them side by side)


https://github.com/foyzulkarim/nextjs-lms-boilerplate

Use for: overall app shell, role-based dashboard layout pattern (student/admin view
toggle), navigation structure.



https://github.com/rishiiih/Learning-Management-System

Use for: NextAuth.js setup, role-based access control (Student / Instructor / Admin
→ we will rename to Student / Faculty / HOD), MongoDB/Prisma models for users,
courses, progress tracking, badges.



https://github.com/Avijit200318/Leetcode-Clone

Use for: Monaco code editor integration, Judge0 API setup for running code in
C/C++/Java/Python/JavaScript, problem listing UI, submission tracking. This becomes
our "Live Compiler Lab" and "Coding Challenges" module.



A gamification UI repo (search GitHub topic gamified-learning filtered by
TypeScript — pick one with XP bar, levels, streaks, badges, leaderboard components
built in React + Tailwind + Framer Motion).

Use for: XP bar, level indicator, streak counter, daily challenge cards, badge
display, leaderboard table — extract these as reusable shared components.





Target Architecture (single Next.js app)

edusync/
├── prisma/
│   └── schema.prisma          # unified data model (see below)
├── src/
│   ├── app/
│   │   ├── (auth)/             # login/signup pages (NextAuth)
│   │   ├── (student)/
│   │   │   ├── dashboard/
│   │   │   ├── stage-1-communication/
│   │   │   ├── stage-2-coding/        # Monaco editor + Judge0 from Leetcode-Clone
│   │   │   ├── stage-3-projects/
│   │   │   └── stage-4-career/
│   │   ├── (faculty)/
│   │   │   └── dashboard/
│   │   ├── (hod)/
│   │   │   └── dashboard/
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── compiler/run/        # Judge0 proxy route
│   │       ├── ai/inixa/             # Gemini API route for AI tutor
│   │       └── gamification/         # XP/coins/streak update endpoints
│   ├── components/
│   │   ├── gamification/   # XPBar, LevelBadge, StreakCounter, Leaderboard, DailyChallengeCard
│   │   ├── compiler/       # CodeEditor, LanguageSelector, OutputPanel
│   │   ├── dashboard/       # shared dashboard widgets per role
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config (from repo #2)
│   │   ├── db.ts             # Prisma client
│   │   ├── judge0.ts          # code execution helper (from repo #3)
│   │   └── gemini.ts          # Inixa AI tutor helper
│   └── store/
│       └── gamification.ts   # Zustand store for XP/coins/streak (client-side cache)
├── .env.example
└── package.json

Unified Prisma Schema (merge the data models from the repos into this shape)

Create ONE schema.prisma with these core models (extend as needed, but don't create
separate schemas per feature):


User (id, name, email, passwordHash, role: STUDENT | FACULTY | HOD, xp, coins,
level, currentStreak, longestStreak, departmentId)
Department (id, name, hodId)
Stage (id, number 1-4, name, unlockXpThreshold)
StageProgress (userId, stageId, status: LOCKED | ACTIVE | COMPLETED, completedAt)
Problem (id, title, description, difficulty, languageSupport, testCases) — from
Leetcode-Clone
Submission (id, userId, problemId, code, language, status, xpAwarded)
Project (id, title, description, teamMembers, repoUrl, status) — Stage 3
Badge (id, name, description, iconUrl)
UserBadge (userId, badgeId, earnedAt)
DailyChallenge (id, date, difficulty, xpReward, coinReward, type)
LeaderboardEntry — can be derived via a query on User, no separate table needed


Step-by-Step Instructions for You (Claude Code)


Set up the base project: npx create-next-app@latest edusync --typescript --tailwind --app,
add shadcn/ui, Prisma, NextAuth, Zustand.
Clone the 3-4 reference repos into a temporary references/ folder (gitignored,
not part of final app) so you can read their source for patterns — then delete this
folder once porting is done.
Port auth + role system from repo #2 into src/lib/auth.ts and middleware. Roles:
STUDENT, FACULTY, HOD. Each role redirects to its own dashboard route group after login.
Port the dashboard shell from repo #1 — sidebar navigation, top bar, role-based
menu items (Student sees Stage 1-4 links, Faculty sees classroom/grading links, HOD
sees department analytics links).
Port the compiler module from repo #3 into src/app/(student)/stage-2-coding/:

Monaco editor component
Judge0 API integration via src/lib/judge0.ts and /api/compiler/run route
Problem list + problem detail pages
Submission saving to the unified Submission model



Extract gamification components from repo #4 into src/components/gamification/
and wire them to the unified User model fields (xp, coins, level, streak) via
/api/gamification/* routes. Every action that earns XP (solving a problem,
completing a quiz, voice challenge, etc.) should call a shared
awardXp(userId, amount, reason) server function.
Build Stage 1 (Communication) as a new module — simple quiz/listening/reading
components using the gamification components for XP rewards. Use placeholder content
for now; structure it so content (questions, audio URLs) comes from the database or
JSON seed files.
Build Stage 3 (Projects) — team workspace pages, project CRUD using the Project
model, simple Kanban-style task list (no need for a real Git integration yet — store
a repoUrl field and just link out to GitHub).
Build Stage 4 (Career) — resume builder form (pulls data from completed stages/
projects/badges), aptitude test module (reuse the quiz components from Stage 1).
Add Inixa AI Tutor — a floating chat widget available on all student pages,
calling /api/ai/inixa which proxies to the Gemini API. System prompt: "You are
Inixa, a bilingual (English + Tamil) AI tutor for engineering students. Explain
concepts simply, mixing Tamil explanations when helpful."
Faculty Dashboard — classroom list, student progress table (XP, stage, streak),
simple announcement posting.
HOD Dashboard — department-wide aggregate stats (average XP, stage completion %,
leaderboard) computed via Prisma aggregate queries.
Seed data: write a prisma/seed.ts that creates sample students, faculty, an
HOD, a handful of coding problems, daily challenges, and badges so the app is
demoable immediately.
Environment variables: create .env.example listing DATABASE_URL,
NEXTAUTH_SECRET, JUDGE0_API_KEY (or self-hosted Judge0 URL), GEMINI_API_KEY.
Single deployment: confirm the whole thing runs with npm run dev on one port,
one Postgres database (via Prisma), no separate backend servers required.


Constraints


TypeScript everywhere, strict mode.
Tailwind CSS + shadcn/ui for styling — keep one consistent design system across all
ported components (re-theme the Leetcode/gamification components to match, don't keep
three different visual styles).
No leftover unused code from the reference repos — only port what's needed.
After each major module is ported, run the dev server and verify it builds and the
relevant pages render before moving to the next module.


Start by setting up the base project (step 1) and show me the folder structure before
proceeding to port the reference repos.


 # EduSync 4.0 — Master Migration Roadmap (Prototype → Production Next.js App)

Use this as the ongoing reference document for all future Claude Code sessions. Update
the checklists as work progresses. This roadmap supersedes the earlier generic
template-based plan — `edusync-babu` (the existing FastAPI + MongoDB + vanilla HTML/JS
prototype) is now the primary source of truth for design AND features.

---

## Phase A — Aesthetic Bridge (Do This First)

Goal: make our existing Next.js/Shadcn app visually match `edusync-babu`'s "Dark Mode
Glassmorphism" design, so every module we build from now on automatically looks correct
— no retrofitting later.

1. Update `tailwind.config.ts`:
   - Add custom colors: `stage1: '#8b5cf6'` (purple), `stage2: '#3b82f6'` (blue),
     `stage3: '#10b981'` (green), `stage4: '#f59e0b'` (amber).
   - Add the dark gradient background as a utility: `bg-app-gradient` →
     `linear-gradient(135deg, #020617, #0f172a)`.

2. Update the base layout (`src/app/layout.tsx` or a root wrapper) to apply
   `bg-app-gradient` and force dark mode by default.

3. Update Shadcn `<Card>` component (or create a `GlassCard` wrapper around it) with:
   `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl`.

4. Update `Topbar.tsx`:
   - Detach from edges (add margin/padding around it).
   - `rounded-full`, `backdrop-blur-xl`, translucent background.
   - This becomes the floating pill nav from the prototype.

5. Update `Sidebar.tsx`: active menu item gets a left border + glow in the relevant
   stage color (Stage 1 page → purple highlight, Stage 2 → blue, etc.) using the new
   tailwind color tokens.

6. Re-skin the already-built Stage 2 page and Gamification components (`XPBar`,
   `LevelBadge`, `StreakCounter`, `Leaderboard`) using `GlassCard` and stage colors —
   this is our test case for the new design system.

7. Build and visually confirm (screenshot or description) before moving to Phase B.

---

## Phase B — Feature Inventory (Critical — Do Not Skip)

`edusync-babu/main.py` has 150+ routes. Before porting anything, create a structured
inventory so nothing gets missed and we can track progress.

1. Create `docs/feature-inventory.md` with a table per module/router group found in
   `main.py` (e.g. `auth`, `stage1_read_router`, `stage1_listening_router`,
   `stage1.ai`, `stage1.roleplay`, `stage2_arcade_router`, `compiler`, `classroom`,
   `career`, `groups`, `hod`, `curriculum`, `speech`, `ai_grading`, etc.)

2. For each router group, list:
   - Route paths + HTTP methods
   - What it does (1 line)
   - MongoDB collections/fields it reads/writes
   - Whether it calls Gemini AI (and what prompt/purpose)
   - Corresponding HTML template(s) it powers
   - **Status column**: `Not Started` / `In Progress` / `Done` (we'll update this as we go)

3. Group these into **Phase C onwards** below — don't port everything at once. Order by
   dependency (e.g. auth/classroom before stage-specific AI features).

4. Show me `feature-inventory.md` before starting Phase C — I'll help prioritize the order.

---

## Phase C — Stage 1: Communication (AI-heavy)

Port from `communication_stage.html` + `stage1_read_router`, `stage1_listening_router`,
`stage1.ai`, `stage1.roleplay`, `speech` routes.

1. Build `/student-dashboard/stage-1-communication` page matching the prototype's
   layout (use Phase A's GlassCard/stage1 purple theme).
2. Port reading comprehension: passage display + questions, store results in Prisma
   (`Submission`-like model or a new `Stage1Activity` model — add to schema).
3. Port listening practice: audio playback + comprehension questions (use Web Speech
   API / `<audio>` for now; reference how the prototype sources audio).
4. Port AI-graded writing (`stage1.ai`): create `/api/ai/stage1-writing-grade` using
   Gemini, return feedback + Tamil explanation, matching prototype's grading logic.
5. Port roleplay/speaking practice (`stage1.roleplay`, `speech`): voice recording +
   Web Speech API recognition + Gemini feedback, matching the prototype's flow.
6. Wire all completions to `awardXp()`.
7. Build, test each sub-feature, update `feature-inventory.md` status to `Done`.

---

## Phase D — Stage 3: Projects/Hackathons

Port from `stage_3.html` + `groups`, `classroom` (team-related) routes.

1. Project workspace, team formation, project CRUD — match prototype's UI/flow.
2. Git-related fields (repo URL link-out, no need for in-app Git initially).
3. AI Code Assistant — port from `ai_grading` routes relevant to Stage 3.
4. Team chat — simple implementation (can use polling initially; real-time later).
5. Problem statements library — seed from prototype's data if available.

---

## Phase E — Stage 4: Career Prep

Port from `career_prep.html` + `career` routes.

1. Mock interview (Gemini-powered, matching prototype's interview question logic).
2. Resume builder — pull from `User`, `StageProgress`, `Project`, `Badge` data.
3. Aptitude tests — port question bank/logic from prototype.
4. "Career Readiness" leaderboard — port the distinct leaderboard logic mentioned in
   the prototype's gamification (separate from the main XP leaderboard).

---

## Phase F — Faculty & HOD Dashboards

Port from `faculty_dashboard.html`, `hod_dashboard.html`, `classroom`, `hod`,
`curriculum` routes.

1. Faculty: classroom management, student tracking table (use Kiranism data-table
   pattern), attendance, grading, content library, AI assistant.
2. HOD: department overview, faculty management, curriculum management, approvals,
   department analytics — match prototype's `hod` route logic.

---

## Phase G — Remaining Gamification Depth

Port from prototype's MongoDB aggregation logic for:
1. Weekly XP leaderboard (vs. all-time) — add time-windowed queries in Prisma.
2. Career Readiness leaderboard (separate from XP leaderboard).
3. Daily challenges generation logic — port the prototype's challenge rotation logic.
4. Streak badge in the floating top-nav pill (per Phase A design).

---

## Phase H — Production Hardening (Before Calling It "Production Ready")

1. **Auth**: remove all dev-only mock logins; add password reset, email verification
   if the prototype has it.
2. **Database**: migrate from SQLite to Postgres (Supabase/Neon/Railway — pick one);
   run `prisma migrate deploy`.
3. **Error handling**: every API route wrapped in try/catch with proper status codes;
   add a global error boundary in the UI.
4. **Security**:
   - Rate-limit AI/compiler endpoints (prevent abuse of Gemini/Judge0 quota).
   - Validate all inputs with Zod.
   - Sanitize any user-submitted code before sending to Judge0.
   - Environment secrets audit — nothing hardcoded.
5. **Performance**: add loading states/skeletons everywhere, paginate large lists
   (leaderboards, submissions, classroom rosters).
6. **AI cost control**: cache/limit Gemini calls where possible (e.g. don't regenerate
   quiz questions on every page load).
7. **Testing**: at minimum, manual end-to-end test of each role's full flow
   (signup → stage progression → XP → leaderboard → dashboards).
8. **Deployment**: deploy to Vercel (frontend+API) + managed Postgres; set up
   environment variables in Vercel dashboard; confirm production build works with
   real API keys (Gemini, Judge0).
9. **Seed/demo data**: prepare a clean demo dataset for the government presentation
   (realistic student names, progress, projects) — separate from dev seed data.

---

## How to Use This Document With Claude Code

For each new session/phase, give Claude Code a prompt like:

> "We're on Phase [X] of `master-roadmap.md`. Please complete the listed tasks for this
> phase, referencing `references/edusync-existing/edusync-babu/` for the exact
> UI/logic to replicate, and `docs/feature-inventory.md` for route details. Update the
> status column in `feature-inventory.md` as you complete each item. Run `npm run build`
> after each major item to catch errors early. Show me the result before moving to the
> next phase."

Always do Phase A and B first — everything else depends on them.