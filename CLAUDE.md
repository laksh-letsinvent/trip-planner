# CLAUDE.md — Trip Planner (PikuCraft)

> Read this first in every session. This is a **family summer project**, not a work artifact. Laksh builds it *with* his daughters (11 and 6). Fun and their ownership beat engineering elegance every time.

## What this is

A family trip planner web app for summer holidays, built by the Singhal family, shared with family and friends. The differentiator: it plans days that survive real kids — not "top 10 attractions" but constraint satisfaction (energy levels, walking limits, ice-cream stops, rainy-day Plan B).

Also a learning vehicle: multi-agent orchestration with CrewAI (deliberately — Laksh's AI-Infra project is framework-free; this is the "now try the framework" counterpart), and a gentle intro to product thinking for the kids.

## The team (respect the roles)

| Role | Owner | What it means for Claude |
|---|---|---|
| Chief Engineer | Laksh (Papa) | Your main counterpart. Plumbing, deploy, keys. |
| Chief Designer | Daughter, 11 | Owns `DESIGN.md`, theme, logo, screens. **Never overwrite her design decisions — flag conflicts, don't fix them.** |
| Chief of Characters & Fun | Daughter, 6 | Owns mascot, loading messages, app voice lines. Same rule: her words stay her words, typos included if Papa says so. |
| Boring-Test Judge / Chief Researcher | Both kids | Kid survey data and AWESOME/BORING ratings feed the Family Filter agent. |

Kid-authored files (`DESIGN.md`, agent personas, loading messages) are **input, not draft**. Suggest, don't silently rewrite. Anything kid-facing you generate (comments in files they'll read, demo scripts) should be plain, playful English an 11-year-old can read.

`DESIGN.md` is now populated (app name, mascot, theme, design system v1, mascot art prompts) — read it before touching anything UI-related. `docs/kickoff-notes.md` has the worksheet roles/answers and survey status.

## Architecture

- **Crew (Python, CrewAI):** three agents — `Scout` (destination research via search tool), `Family Filter` (rewrites plans through kid-constraint lens; persona authored by the 11-year-old), `Planner` (day-by-day itinerary + rainy-day Plan B per day + budget + packing list).
- **API:** FastAPI wrapping the crew. Crew runs take 1–3 min → async job + polling endpoint, not request/response.
- **Frontend:** Next.js + shadcn/ui, theme exported from tweakcn per `DESIGN.md`. Input form: destination, dates, kids' ages, daily budget, energy level. Loading screen shows the agents "talking" using the 6-year-old's lines.
- **Deploy:** Laksh's Hetzner VM + own domain. Keep it lightweight — one Docker compose or two systemd services, no k8s, no DB in v1 (job state in memory or a JSON file is fine).

## Cost rails (free tiers — hard constraint)

- **LLM:** Groq free tier (Llama 3.1 8B has the most headroom: ~14.4k req/day, ~500k tokens/day). Design prompts to fit; cache the system prompt.
- **Search:** Serper free 2,500 queries (one-time) — budget ~5 searches per plan. Fallback: Brave Search API (2,000/month recurring).
- Keys live in `.env` on the VM and locally. **Never commit keys. Never hardcode them.** `.env.example` documents what's needed.
- Add a simple per-day request counter early — free-tier limits are the throttle, hitting them should degrade politely ("the robots are napping, try tomorrow").

## Phases (weekend-sized; demo every weekend, even broken)

1. **Crew in the terminal** — three agents working, kid personas plugged in, output readable in console. No UI. **Built and live-demoed** — Lisbon, 5 days, kids 11 and 6, £150/day, medium energy ran end to end: valid `TripPlan`, every day had `plan_b_rainy`, JSON saved to `runs/`.
2. **Web UI** — Next.js form + polling + themed results page per `DESIGN.md`. **Built and browser-tested** — full happy path (form → loading with live agent stage → results with Plan B reveal), robots-napping 429 screen, and a friendly retry state when the API goes down mid-poll (not an infinite spinner). Pending: Chief Designer's screen-by-screen sign-off against `DESIGN.md`.
3. **Ship** — deploy to Hetzner, family WhatsApp launch, kids' names on the About page.

Current phase: **2b, theme glow-up built (Candy Sky + Sticker Party + Big Candy Header, `docs/build-prompts/phase2b-theme-glow-up.md`), pending Chief Designer's sign-off at the weekend demo — same gate phase 2 was already waiting on, plus Mummy's Boring-Test verdict on phase 1 content.** Design is ahead of code on ratification only: app name, mascot, and theme are locked (see `DESIGN.md`), and the theme punch-up proposed in `docs/theme-glow-up-options.md` (all three options A+B+C combined) is now implemented — see `DESIGN.md`'s "Theme v1.1" section for the change list and the open badge-placement question. Don't restyle further ahead of her decision; if she vetoes a piece, that piece reverts. Mascot + badge art is IN: backgrounds stripped from Laranya's Recraft art (`docs/muscot.png` / `docs/logo.png` → `web/public/pip-mascot.png` / `pip-logo.png`), wired into `pip-mascot.tsx`, the new `CandyHeader`, and the favicon. Survey is live, results expected next week — feed into `Family Filter` persona once in.

**Decision made at end of phase 1 (the build-plan.md decision point):** Planner swapped to `llama-3.3-70b-versatile`. 8B's native tool-calling broke the nested `TripPlan` schema (misplaced closing brace, dropped `pip_says`) on first live attempt — the exact risk build-plan.md named. Scout and Family Filter stayed on 8B (plain markdown output, no schema to break).

**Live-testing findings, not visible from reading the code:**
- This Groq account's actual free-tier cap is 6,000 tokens/minute (rolling window) — well below the ~14.4k req/day headroom build-plan.md assumed, and a single Planner call can burst near that ceiling on its own. Added a 20s pause between agent tasks (`TASK_PACING_SECONDS` in `main.py`) so the window recovers; no custom token-accounting needed.
- CrewAI (as of 1.15.2) tags every LLM message for prompt-caching in a way that only "native provider" classes (OpenAI, Anthropic) strip before sending — Groq goes through the generic LiteLLM path and gets a 400 rejecting the unknown field. Patched around in `crew/patches.py` (`disable_prompt_cache_tagging`) since prompt caching isn't relevant to Groq's free tier anyway.
- `step_callback` doesn't reliably fire in this CrewAI version's newer execution path, so the daily-request counter (`guards.py`) is driven off `task_callback` instead (one increment per finished task).
- Needed `fastapi` as an explicit dependency even though nothing here imports it — litellm's tool-calling code path imports it transitively.
- Groq is deprecating `llama-3.1-8b-instant` on 2026-08-16 (recommended swap: `openai/gpt-oss-20b`) — still active so kept for Scout/Family Filter, but re-check before that date.

**Phase 2 build notes:**
- `api/` imports `crew/`'s modules directly (via `sys.path`, not a subprocess) — the job needs a real `TripPlan` object and per-task stage callbacks, and this matches the eventual Docker Compose shape (api + web + Caddy, no separate crew service — see `docs/build-plan.md`). `api/models.py` had to be renamed to `api/schemas.py` since `crew/models.py` would otherwise shadow it once `crew/` is on `sys.path`.
- Shared crew-orchestration logic (Groq patches, task pacing, stage tracking) now lives in `crew/runner.py`, used by both `crew/main.py` (CLI) and `api/main.py` — extracted once the API became a second real caller.
- `api/`'s `.env` loading points at `crew/.env` explicitly — one set of keys, not duplicated per service.
- This Next.js install is v16.2 with React 19.2 — meaningfully newer than typical training-data knowledge (Turbopack default, async route params, etc). `web/AGENTS.md` (auto-loaded) flags this; the bundled docs are in `web/node_modules/next/dist/docs/`. The whole planner flow (form → loading → results) is one client-side state machine in `TripPlannerApp`, not separate routes — sidesteps the v16 async-params changes entirely since there was no reason to need dynamic routes here.
- Candy Pop tokens live as CSS variables in `web/src/app/globals.css` (hex values, not oklch, so they stay directly traceable to `DESIGN.md`'s spec). Pill buttons are `variant="pill"` / `"pill-outline"` added to shadcn's `Button`; chips are `variant="chip"` on `Badge`.

## Guardrails

- **v1 scope cuts, do not add without asking:** live pricing, booking links, maps integration, user accounts, saved trips, database.
- **Kid safety:** no kids' real names, photos, or school details anywhere public-facing. Survey responses are anonymous. About page uses first names or nicknames only — kids' choice. (Internal docs like `DESIGN.md` and `docs/` use real first names, same as the worksheet — the public-facing line only kicks in for the About page and anything shared outside the family.)
- Rainy-day Plan B per day is **non-negotiable** — it's the product's whole point for a UK family.
- Keep code small and readable — Papa will walk the kids through it. Comments explain *why*, in plain English.
- Test case for done: it plans a day the 6-year-old survives and the 11-year-old doesn't call boring.

## Planned layout

```
crew/        # Python: agents, tasks, personas/ (kid-authored), main.py, runner.py — BUILT (phase 1)
api/         # FastAPI wrapper (imports crew/ directly) — BUILT (phase 2)
web/         # Next.js app (App Router, shadcn/ui, Candy Pop theme) — BUILT (phase 2)
DESIGN.md    # 11-year-old's design spec — canonical for all UI work — POPULATED
docs/        # handover doc, kickoff-notes.md (roles/answers/survey), build-plan.md (stack decisions), build-prompts/ (phase 1–3, paste into Claude Code)
README.md    # quickstart: how to run the crew, the API, and the web app locally
```
