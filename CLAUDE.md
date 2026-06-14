# CLAUDE.md — EduSync 4.0 Project Brain

This file is the persistent context for Claude Code across all sessions. Read this
fully before starting any work. Keep it updated as the project evolves — especially
the "Current Status" section at the bottom.

---

## 1. Project Overview

EduSync 4.0 is an AI-powered, gamified learning + campus management platform for
engineering college students in Tamil Nadu, built by a 10-member B.Tech AI&DS student
team ("Team Inixa"). The goal is to convert an existing prototype into a production-ready
Next.js + TypeScript application for submission to the Government of Tamil Nadu.

**Core concept**: 4 progressive learning stages (Communication → Coding → Real-World
Projects → Career Prep), gamification (XP/coins/levels/streaks/leaderboards), bilingual
(English + Tamil) AI tutor "Inixa", and 3 user roles (Student, Faculty, HOD).

---

## 2. Source of Truth — Reference Repositories

All located in `references/` (full source committed to this repo for team access):

- **`references/edusync-existing/edusync-babu/`** — **PRIMARY REFERENCE**. This is our
  own existing prototype: FastAPI (Python) + MongoDB backend with 150+ routes, vanilla
  HTML/CSS/JS frontend. For ANY feature, check here FIRST for existing design, content,
  and logic before inventing something new. The "Dark Mode Glassmorphism" aesthetic
  (see Section 4) comes from here.

- **`references/edusync-existing/edusync/`** — mostly empty Next.js init, ignore.

- **`references/nextjs-lms-boilerplate/`** — secondary reference for general dashboard
  shell patterns (mostly superseded by our own build now).

- **`references/learning-management-system/`** (rishiiih) — reference for NextAuth +
  RBAC patterns (already ported in Phase 2).

- **`references/leetcode-clone/`** (Avijit200318) — reference for Monaco editor +
  Judge0 integration (already ported in Phase 4, Stage 2).

- **`references/next-shadcn-dashboard-starter/`** (Kiranism) — reference for
  data-table patterns (`@tanstack/react-table`) used in Leaderboard, Faculty
  Submissions, HOD Analytics.

- **`references/flowclass/`** — reference for education-domain list/detail UX
  (student tracking tables, scheduling).

**Rule**: When porting a feature, always check `edusync-babu` first for the canonical
design/logic. Other reference repos are for code PATTERNS only (how to structure a
data table, how to set up Judge0, etc.), not feature definitions.

---

## 3. Tech Stack (Target — Our New App)

- **Framework**: Next.js (App Router) + TypeScript (strict mode, no `any`)
- **UI**: Tailwind CSS + shadcn/ui — single design system, no other component kits
- **Database**: SQLite (dev) via Prisma → Postgres (production, Phase H)
- **Auth**: NextAuth.js with Prisma adapter, role-based (STUDENT / FACULTY / HOD)
- **State**: Zustand for client-side state (gamification cache, UI state)
- **AI**: Google Gemini via `@google/generative-ai` SDK — used for Inixa tutor, AI
  grading (writing/speaking), code review, mock interviews
- **Code execution**: Judge0 (RapidAPI or self-hosted) for Stage 2 compiler
- **Speech**: Web Speech API (browser native) for speaking/pronunciation exercises

---

## 4. Design System — "Dark Mode Glassmorphism" (Established in Phase A)

- Background: `bg-app-gradient` → `linear-gradient(135deg, #020617, #0f172a)`, dark
  mode always on.
- Cards: `GlassCard` component → `bg-white/5 backdrop-blur-md border border-white/10
  rounded-xl`
- Stage colors (use for active states, glows, borders):
  - Stage 1 (Communication): `#8b5cf6` (purple) — `text-stage1` / `border-stage1`
  - Stage 2 (Coding): `#3b82f6` (blue) — `text-stage2` / `border-stage2`
  - Stage 3 (Projects): `#10b981` (green) — `text-stage3` / `border-stage3`
  - Stage 4 (Career): `#f59e0b` (amber) — `text-stage4` / `border-stage4`
- Topbar: floating pill (`rounded-full`, `backdrop-blur-xl`, detached with margin)
- Sidebar: active item gets left border + inner glow in the current stage's color
- **Every new page/component must use `GlassCard` and these tokens — no plain white
  shadcn defaults.**

---

## 5. Data Model Conventions

- Central `User` model: `id, name, email, role (STUDENT/FACULTY/HOD), xp, coins, level,
  currentStreak, longestStreak, departmentId`
- Level formula: `level = floor(xp / 500) + 1`
- Coin formula: 10:1 XP-to-coin ratio (10 XP earned = 1 coin)
- All XP-granting actions MUST go through the shared `awardXp(userId, amount, reason)`
  function in `src/lib/gamification.ts` — never update `xp`/`coins` directly elsewhere.
- Activity/submission tracking models follow the `Submission` pattern established in
  Stage 2: `{ userId, ...activityFields, status, xpAwarded, createdAt }`. Reuse this
  shape for new activity types (e.g. `Stage1Activity`) rather than inventing new shapes.

---

## 6. Code Structure Standards (MANDATORY for all new modules)

Don't write monolithic files. For every feature/module:

- `page.tsx` — layout/composition only, minimal logic
- `components/` — small, focused UI components (one component = one responsibility)
- `hooks/use[Feature].ts` — client-side state/logic
- `lib/[feature]-service.ts` — server-side business logic (DB, Gemini, Judge0 calls)
- `types/[feature].ts` — TypeScript interfaces, shared between client/server
- `schemas/[feature].ts` — Zod validation schemas for API I/O

API routes (`route.ts`) stay thin: validate (Zod) → call service function → return
response. Business logic lives in `lib/`, never inline in routes.

- No `any` types.
- Every API route: try/catch, consistent error shape `{ error: string, code?: string }`,
  correct HTTP status codes.
- Every async UI component: explicit loading/error/empty states.
- Magic numbers (XP amounts, thresholds, time limits) → `src/lib/config/`.
- Gemini API calls → comment explaining prompt purpose + expected response shape.
- After building a feature: run `npm run build`, list the new file tree, before moving on.

---

## 7. Git Workflow

- **Never `git push --force`** without explicit permission — team members may have
  unpushed local work.
- One phase/sub-task = one branch (e.g. `phase-c-stage1a-reading-listening`). Merge to
  `main` only when build passes and the sub-task is complete.
- Commit messages: `Phase [X]: [short description]` (e.g. `Phase C: Stage 1 reading +
  listening modules`).
- Don't commit mid-feature broken states to `main`.

---

## 8. AI Cost & Rate Limiting

- All Gemini-calling endpoints need basic debounce/rate-limiting (e.g. don't allow
  resubmission of the same prompt within 30s) to avoid quota burn during dev/testing.
- Cache AI-generated content where reasonable (e.g. don't regenerate the same quiz
  question set on every page load).

---

## 9. Roadmap & Status Tracking

- Full phase breakdown: `docs/master-roadmap.md`
- Detailed route/feature inventory from `edusync-babu`: `docs/feature-inventory.md`
  (has a Status column — update as features are ported)

---

## 10. Current Status (UPDATE THIS SECTION AS WE PROGRESS)

- ✅ Phase 1: Base project setup — Done
- ✅ Phase 2: Reference repos cloned, NextAuth + RBAC ported — Done
- ✅ Phase 3: Dashboard shell, sidebar, role-aware navigation — Done
- ✅ Phase 4 (partial): Stage 2 (Monaco + Judge0) + Gamification (XP/levels/streaks/
  leaderboard) wired to real Prisma/SQLite DB — Done
- ✅ Phase A: Aesthetic bridge (glassmorphism, stage colors, floating topbar) — Done
- ✅ Phase B: Feature inventory of `edusync-babu`'s 150+ routes — Done
- ✅ Phase C: Stage 1 (Communication, AI-heavy) — Done
  - ✅ Reading + Listening modules — Done (Note: Listening uses TTS as audio placeholder for now, pending real audio assets)
  - ✅ Writing + Speaking (AI) — Done
- ⬜ Phase D: Stage 3 (Projects)
- ⬜ Phase E: Stage 4 (Career Prep)
- ⬜ Phase F: Faculty & HOD dashboards
- ⬜ Phase G: Gamification depth (weekly/career leaderboards, daily challenges)
- ⬜ Phase H: Production hardening & deployment

**Team split**: 2 active members. Suggested parallel work — Person A on Stage 1
sub-modules, Person B on Stage 3 (Projects) or Stage 1's AI-heavy parts, each on
separate branches.