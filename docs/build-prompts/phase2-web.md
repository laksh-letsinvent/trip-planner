# BUILD PROMPT — Phase 2: Web UI

> Paste below the line into Claude Code from the repo root. Prerequisite: phase 1 done (`crew/` works from the terminal). Read `CLAUDE.md` and `DESIGN.md` first — `DESIGN.md` is canonical for everything visual and is owned by the 11-year-old Chief Designer: follow it exactly, flag conflicts, never improvise around it.

---

Build phase 2 of the Magic Trip Planner: a FastAPI wrapper around the existing crew, and a Next.js frontend themed to the Candy Pop design system. Exit criterion: the Chief Designer reviews every screen against `DESIGN.md` and signs off.

## Part A — API (`api/`)

FastAPI app wrapping `crew/` (import it as a package or subprocess — pick the simpler that works; document why in a comment).

- `POST /api/plan` — body: destination, days, kids_ages, budget_per_day, energy. Validates input, checks the daily counter (reuse `crew/guards.py` — do not duplicate), creates a job, kicks off the crew via `BackgroundTasks`, returns `{job_id}`.
- `GET /api/plan/{job_id}` — returns `{status: queued|running|done|failed, stage: scout|family_filter|planner, result?: TripPlan, error?}`. `stage` comes from a per-job progress file the crew callback writes — the frontend uses it to show which agent is "talking".
- Job store: dict in memory, mirrored to `runs/jobs.json` so a restart doesn't 404 finished jobs. No database.
- If the daily cap is hit: `POST` returns 429 with `{error: "robots_napping"}` — the frontend has a friendly screen for this.
- CORS open to the web app's origin only.

## Part B — Frontend (`web/`)

Next.js (App Router) + Tailwind + shadcn/ui. Follow `DESIGN.md` v1 exactly:

- **Tokens:** Candy Pink `#FF6F91` (primary/brand), Teal `#4CD4C6` (primary buttons, links), Sunshine Yellow `#FFD34E` (chips), Navy `#1B2A4A` (text), white background. Wire these into the Tailwind/shadcn theme as CSS variables (tweakcn-style), not scattered hex.
- **Fonts:** Baloo 2 (headings) + Nunito (body) via `next/font/google`.
- **Components per spec:** teal pill primary buttons; white pink-outline pill secondary; yellow chips with navy text; white cards, 16px radius, soft shadow.

Screens:

1. **Home / plan form** — Pip placeholder + "Leave the planning to Pip!", form: destination (text), dates or number of days, kids' ages (add/remove), daily budget (£ slider or input), energy level (chilled / medium / pack-it-in as chips). Submit → loading.
2. **Loading** — the show. Three agent avatars (Scout / Family Filter / Planner — simple emoji or shapes until real art lands) with the active `stage` from polling visibly "talking". Rotate the thinking-messages **loaded from `DESIGN.md`** (parse the bullet list under "Funny thinking-messages" at build time — the 6-year-old adds lines there, they must show up without code changes). Poll every 3s.
3. **Results** — one card per day: theme as heading, morning/afternoon/evening, walking-effort + ice-cream chips, food note, and Plan B behind a "☔ If it rains…" reveal (flip/expand). Packing list as a checkable list. Budget summary. `pip_says` as a speech bubble from the Pip placeholder. A "plan another trip" button.
4. **Robots napping** — friendly full-screen state for the 429, sleeping-robot vibe, "try again tomorrow!".

Mascot art: a single `<PipMascot />` component with a placeholder (simple SVG penguin or emoji) — Laranya's final Recraft art will drop in as one file swap. Do not generate penguin art; her sketch is canonical.

**No About page yet** — that's phase 3, and the kids choose their public names first (kid-safety rule in `CLAUDE.md`).

## Dev ergonomics

- Root `README.md` quickstart: run API (`uvicorn`), run web (`next dev`), env vars needed. Plain English — kids may read it.
- `web/.env.example` with `NEXT_PUBLIC_API_URL`.
- Mobile-first: the family will use this on phones. Check every screen at 375px width.

## Acceptance

1. Full happy path in the browser: form → loading with rotating kid-lines and correct live stage → results with every day showing its Plan B reveal.
2. Add a new thinking-message line to `DESIGN.md`, restart web → it appears in rotation with no code change.
3. Simulate the 429 → robots-napping screen.
4. Kill the API mid-poll → frontend shows a friendly retry state, not a spinner of death.
5. All screens pass the squint test against `DESIGN.md` tokens at 375px.

When done, update `CLAUDE.md` phase status. Then book the real review: Chief Designer, side by side with `DESIGN.md`.
