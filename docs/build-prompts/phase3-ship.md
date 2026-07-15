# BUILD PROMPT — Phase 3: Ship to Hetzner

> Paste below the line into Claude Code from the repo root. Prerequisites: phases 1–2 done. Before running this, the kids must have chosen their public names for the About page (first names or nicknames — their call, per `CLAUDE.md` kid-safety rules).

---

Ship the Magic Trip Planner to Papa's Hetzner VM behind the family domain. Keep it boring and small — this must survive unattended while the family is actually on holiday using it.

## Deploy shape

Docker Compose, three services:

- **api** — Python image, uvicorn serving `api/`, `crew/` inside the same image (they share code and a filesystem for job state). Volume-mount `runs/` so the daily counter and job history survive restarts.
- **web** — Next.js standalone build, `NEXT_PUBLIC_API_URL` pointing at the public API path.
- **caddy** — reverse proxy + automatic HTTPS. `/` → web, `/api/*` → api. Caddyfile of ~5 lines; the domain name comes from `.env`, ask Papa for the actual domain rather than inventing one.

Rules:

- `.env` lives on the VM only (GROQ_API_KEY, SERPER_API_KEY, DOMAIN). `.env.example` in the repo documents it. Nothing secret in images or compose file.
- Resource-cap the containers modestly (this shares a VM with other things): memory limits in compose, and set uvicorn to 1 worker — the daily counter assumes a single process.
- Healthcheck on the api service; restart: unless-stopped on everything.
- A `deploy.md` in `docs/`: exact first-deploy steps (clone, .env, `docker compose up -d --build`) and update steps (`git pull && docker compose up -d --build`). Written so Papa-in-six-months can follow it cold.

## About page (`web/app/about`)

Now it exists. Content:

- The team, with the kids' **chosen public names** and their real roles (Chief Designer, Chief of Characters & Fun, Boring-Test Judge, Chief Researcher, Chief Engineer). No last names, no school, no ages beyond what the kids approve, no photos.
- One line on how it works: "Three robot helpers — a Scout, a Family Filter, and a Planner — argue about your holiday until it's fun." Keep the girls' voice, not corporate copy.
- Pip gets credit: "Mascot: Pip the Penguin, drawn by the Chief Designer."

## Launch checklist (do these, then stop)

1. Full happy-path plan generated on the live URL from a phone on mobile data (not home wifi).
2. The robots-napping path verified live (temporarily set the cap to 1 to trigger it, then set it back).
3. Restart the VM's docker daemon → app comes back by itself; counter and finished jobs intact.
4. HTTPS certificate valid; http redirects to https.
5. Update `CLAUDE.md`: phase 3 done, add the live URL.

Then the launch itself is the family's job, not Claude Code's: the kids send the link to the family WhatsApp group.

## Explicitly out of scope

Monitoring stacks, CI/CD pipelines, staging environments, backups beyond the `runs/` volume, analytics. If the app falls over, Papa will hear about it at dinner — that's the alerting system.
