# Magic Trip Planner 🐧

"Leave the planning to Pip!" — a family trip planner built by the Singhal family.

This is a **quickstart for running it on your own computer**. For the "why" behind
how it's built, see `CLAUDE.md` (rules) and `docs/build-plan.md` (stack decisions).

## What you need first

- A Groq API key (free) — https://console.groq.com/keys
- A Serper API key (free) — https://serper.dev
- `uv` (Python) and `node`/`npm` installed

## 1. Set up your keys

```
cd crew
cp .env.example .env
```

Open `crew/.env` and paste in your `GROQ_API_KEY` and `SERPER_API_KEY`. Both the
crew CLI and the API read this same file — you only need to do this once.

## 2. Run the crew from the terminal (no UI)

```
cd crew
uv run python main.py --destination "Lisbon" --days 5 --kids-ages 11 6 \
    --budget-per-day 150 --energy medium
```

Add `--dry-run` to check everything's wired up without spending any API calls.

## 3. Run the web app

You need two things running at once: the API (talks to the crew) and the web
app (what you see in the browser). Open two terminal windows/tabs.

**Terminal 1 — the API:**

```
cd api
uv run uvicorn main:app --port 8000
```

**Terminal 2 — the web app:**

```
cd web
cp .env.example .env.local   # only needed once, or if you changed the API port
npm install                  # only needed once
npm run dev
```

Then open http://localhost:3000 in your browser. Fill in the form and Pip's
crew gets to work — the loading screen shows which agent is talking, and the
results page shows your day-by-day plan with rainy-day backups.

## Troubleshooting

- **"The robots are napping"** — the free-tier daily limit was hit. Try again
  tomorrow (this is expected behaviour, not a bug).
- **"Pip lost the map!"** — the web app couldn't reach the API. Make sure
  Terminal 1 (the API) is still running.
- Web app talks to the API on `http://localhost:8000` by default. If you run
  the API on a different port, update `NEXT_PUBLIC_API_URL` in `web/.env.local`.
