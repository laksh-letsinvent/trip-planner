# BUILD PROMPT — Phase 1: Crew in the terminal

> Paste everything below the line into Claude Code from the repo root (`trip-planner/`). Read `CLAUDE.md` first — it's the boss file.

---

Build phase 1 of the Magic Trip Planner: a three-agent CrewAI crew that plans a family holiday, runnable from one terminal command. No API, no UI — the terminal output IS this weekend's demo, and two kids (11 and 6) will be watching it run.

## Context

Read `CLAUDE.md` (rules), `DESIGN.md` (theme + mascot — only the thinking-messages matter this phase), and `docs/kickoff-notes.md` (worksheet data that seeds the Family Filter). Respect the guardrails: no scope beyond this prompt, kid-authored content is input not draft, keys never committed.

## What to build

Everything under `crew/`:

```
crew/
  pyproject.toml          # uv-managed, Python 3.11+; deps: crewai, crewai-tools, pydantic, rich, python-dotenv
  .env.example            # GROQ_API_KEY, SERPER_API_KEY — with one-line comments on where to get them
  main.py                 # CLI entrypoint
  agents.py               # three agents
  tasks.py                # three tasks
  models.py               # Pydantic output contract
  guards.py               # search budget + daily request counter
  personas/
    family_filter.md      # kid-editable persona (see below)
  runs/                   # output JSON lands here, gitignored
```

Also create a root `.gitignore` (env files, runs/, __pycache__, node_modules for later) if one doesn't exist.

## The agents (Process.sequential — Scout → Family Filter → Planner)

All agents on Groq `llama-3.1-8b-instant` via CrewAI's LLM class (`llm=LLM(model="groq/llama-3.1-8b-instant")`). **Check current Groq model names before coding** (https://console.groq.com/docs/models) and swap in the closest current equivalent if this one is gone — note any swap in a code comment.

1. **Scout** — researches the destination with SerperDevTool: top family-friendly things to do, typical weather for the travel dates, indoor options, rough costs. Output: a research brief (markdown, not JSON).
2. **Family Filter** — rewrites the brief through the kids' constraint lens. Its backstory/persona is **loaded from `personas/family_filter.md` at runtime** — never hardcoded, because an 11-year-old owns that file. It scores every proposed activity AWESOME / OK / BORING and cuts or fixes BORING ones.
3. **Planner** — produces the final structured plan, `output_pydantic=TripPlan`.

## The output contract (models.py)

```python
class Activity(BaseModel):
    name: str
    why_kids_like_it: str
    rough_cost_gbp: str          # "free", "~£20 family", etc.
    walking_effort: Literal["easy", "medium", "lots"]

class DayPlan(BaseModel):
    day_number: int
    theme: str                   # e.g. "Beach + ice cream day"
    morning: Activity
    afternoon: Activity
    evening: str                 # low-key, one line
    plan_b_rainy: Activity       # REQUIRED — validation must fail without it
    ice_cream_stops: int         # minimum 1 :)
    food_note: str               # where favourite-food needs are met today

class TripPlan(BaseModel):
    destination: str
    days: list[DayPlan]
    packing_list_kids: list[str] # 8–12 items, kid-focused
    budget_summary: str
    pip_says: str                # one cheerful sign-off line from Pip the Penguin
```

Plan B per day is the product's whole point — if the model omits one, retry that task once with the validation error in the prompt; if it fails again, exit loudly, don't fabricate.

## Persona file (personas/family_filter.md)

Seed it from the worksheet data in `docs/kickoff-notes.md`, written in plain English an 11-year-old can edit:

- Days are AWESOME when: favourite food, shopping, swimming.
- Days are BORING when: no favourite food, parents saying "NO!!" all the time.
- Assume kids aged as per the CLI input; one younger kid tires after ~2–3 hours walking.
- Ice cream is load-bearing infrastructure.

Top of file: a comment block saying this file belongs to the Chief Designer & Chief of Characters, Papa's crew just reads it, and a `TODO(Laranya): make these rules yours` marker. Leave an empty `## Survey says` section for research findings landing next week.

## Guardrails (guards.py)

- **Search cap:** max 5 Serper calls per plan. Wrap/subclass the tool; when the budget is spent, return "search budget used up — work with what you have" instead of calling out.
- **Daily counter:** persist LLM request count to `runs/counter.json` keyed by date. At start of run, if today's count > 1,000, refuse politely: print "🤖💤 The robots are napping — try tomorrow!" and exit 0. Increment via CrewAI's step callback (or the simplest reliable hook — don't build a metrics system).

## CLI (main.py)

```
uv run python main.py --destination "Lisbon" --days 5 --kids-ages 11 6 \
    --budget-per-day 150 --energy medium [--dry-run]
```

- `--dry-run`: print the resolved config, persona file contents, and which model/tools would run — zero API calls. Build this first; it's how the setup gets verified before keys exist.
- Use `rich` to make the run watchable: a banner ("🐧 Leave the planning to Pip!"), each agent announced with name + colour as it starts, its output streamed/printed as it finishes.
- While waiting, print the thinking-messages from `DESIGN.md` (load them from the file — the 6-year-old will add more there later).
- On success: pretty-print the plan as rich tables (one per day, Plan B visibly flagged), save raw JSON to `runs/plan-<timestamp>.json`, and print a final line with API usage: "Used N LLM calls, M searches. Free tier: plenty left."

## Code style

Small, flat, readable — Papa walks the kids through this code. Comments explain *why* in plain English. try/except around every external call with friendly error messages ("Groq didn't answer — check GROQ_API_KEY in .env?"). No classes where a function does. No abstractions for one caller.

## Acceptance (run these before calling it done)

1. `uv run python main.py --dry-run ...` works with no `.env` at all.
2. Full run with keys: Lisbon, 5 days, kids 11 and 6, £150/day, medium energy → valid `TripPlan`, every day has `plan_b_rainy`, JSON saved to `runs/`.
3. Kill the network mid-run → friendly error, no traceback vomit.
4. Run twice; counter in `runs/counter.json` increments across runs.
5. Delete a required field from the Planner's output contract test (or simulate): validation retry path fires.

When done, update `CLAUDE.md`: planned-layout annotations (`crew/` → built) and current phase status. Do not touch `DESIGN.md`.
