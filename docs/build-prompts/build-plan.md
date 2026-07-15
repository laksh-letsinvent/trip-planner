# Build Plan — Magic Trip Planner

> Companion to `CLAUDE.md`. That file says what we're building and the rules; this file says how, in what order, and which tech — with reasons. Build prompts live in `docs/build-prompts/`.

## How we build

Same division of labour as Papa's AI-Infra project: these build prompts get pasted into Claude Code, Papa runs the builds, kids review at the weekend demo. One phase per weekend, demo even if broken.

## Stack decisions

| Layer | Choice | Why | What would change it |
|---|---|---|---|
| Crew | CrewAI, `Process.sequential` | Sequential is deterministic and cheap: Scout → Family Filter → Planner is a pipeline, not a debate. Hierarchical mode adds a manager-LLM call per step — flaky on small models and burns free tier. | Never for v1. |
| LLM | Groq `llama-3.1-8b-instant` via CrewAI's LiteLLM support | Most free-tier headroom (~14.4k req/day, 500k tokens/day). A trip plan is ~10–20 calls, so dozens of plans/day. | 8B writes mediocre itineraries or breaks JSON → swap Planner (only) to `llama-3.3-70b-versatile` (1k req/day cap — still ~50 plans/day). Decision point: end of phase 1, judged by the Boring-Test Judge. |
| Search | Serper via `crewai-tools` `SerperDevTool`, hard cap 5 searches/plan | 2,500 free one-time ≈ 500 plans. Cap enforced in code, not vibes. | Credits run out → Brave Search API (2,000/month recurring). |
| Plan output | Pydantic model + CrewAI `output_pydantic` | The itinerary is a contract: every day MUST have a Plan B. Schema validation is how we enforce the non-negotiable, plus it gives the frontend a stable JSON shape. | Nothing — this stays. |
| Python setup | `uv` + `pyproject.toml`, Python 3.11+ | Fast, one lockfile, no venv ceremony to explain to kids. | Already have a preferred setup on the VM → pip/venv is fine, don't fight it. |
| Console output | `rich` | Phase 1's demo IS the terminal. Agent chatter in colour keeps a 6-year-old watching. | — |
| API | FastAPI + `BackgroundTasks`, job state in a JSON file | Crew runs take 1–3 min → async job + polling. One process, family traffic: celery/redis/DB would be jewellery. | >1 concurrent user becomes real (it won't). |
| Frontend | Next.js (App Router) + Tailwind + shadcn/ui | Per CLAUDE.md. shadcn components take the Candy Pop tokens from `DESIGN.md` via a tweakcn-style theme file. | — |
| Fonts | Baloo 2 (headings) + Nunito (body) via `next/font` | Chief Designer's spec, first-listed pairing. | Laranya changes `DESIGN.md`. |
| Polling | Plain `GET /api/plan/{id}` every 3s | Websockets for a 2-minute wait is over-engineering. The loading screen entertains instead (Pip's lines). | — |
| Deploy | Docker Compose on Hetzner: `api` + `web` + Caddy | Caddy gives auto-HTTPS on the domain with 3 lines of config. Compose = one `docker compose up -d`. | — |

**Deliberately not using:** LangGraph (that's the work track), any database, redis, auth/accounts, websockets, k8s, LangSmith/observability SaaS (console logs are the observability).

## Phases

### Phase 1 — Crew in the terminal (this weekend, ~4–6 hrs)
Build prompt: `build-prompts/phase1-crew.md`

Three agents working end to end from one CLI command. Family Filter persona seeded from the worksheet data (favourite food, swimming, "parents saying NO!!"), marked TODO for Laranya to edit and survey data to extend. Pydantic-validated plan with Plan B per day, search cap, daily request counter, `--dry-run`.

**Demo test:** plan "Lisbon, 5 days, kids 11 and 6, £150/day, medium energy" live in the terminal. Done when Mummy (Boring-Test Judge) scores the plan and no day is missing its Plan B.

**Decision at end of phase:** is 8B good enough for the Planner agent, or swap to 70B?

### Phase 2 — Web UI (next weekend, ~5–7 hrs)
Build prompt: `build-prompts/phase2-web.md`

FastAPI wrapper (submit job → poll → result) plus the Next.js app: input form, loading screen with Pip + the girls' thinking-lines + live agent status, results page as day cards with Plan B reveal. Candy Pop theme throughout. Mascot art slot ships with a placeholder until Pip's final art lands (Recraft pass on Laranya's sketch — parallel track, not blocking).

**Demo test:** Laranya reviews every screen against `DESIGN.md`. Her sign-off is the exit criterion, not Papa's.

### Phase 3 — Ship (weekend after, ~2–4 hrs)
Build prompt: `build-prompts/phase3-ship.md`

Dockerise, Caddy with the domain, `.env` on the VM, request counter persisted in a volume. About page with the team's chosen names. Family WhatsApp launch.

**Demo test:** Mehar opens the real URL on a phone and gets a plan without help.

### Parallel tracks (not weekend-gated)
- **Pip's art:** Recraft image-to-image on Laranya's sketch (prompts in `DESIGN.md`). Drop-in replacement for the placeholder — any weekend.
- **Survey results:** when responses are in, pull the summary, write `docs/survey-results.md` kid-readable, and fold findings into the Family Filter persona as rules ("ice cream: majority said 3+").

## Risks, named

1. **8B model breaks structured output.** Most likely failure. Mitigation: small per-task prompts, Pydantic validation with one retry, and the 70B swap held in reserve for the Planner only.
2. **Crew latency kills the demo.** 1–3 min feels long on stage. Mitigation: stream agent chatter in phase 1; Pip's loading lines in phase 2. The wait is a feature if it's entertaining.
3. **Free-tier exhaustion mid-demo.** Mitigation: the request counter and the polite "robots are napping" message are phase 1 requirements, not polish.
4. **Kid attention span.** The real risk. Mitigation is the weekend-demo rule itself: something visible moves every week, and phases are sized to finish, not to impress.
