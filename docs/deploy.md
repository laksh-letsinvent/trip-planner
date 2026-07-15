# Deploy — Magic Trip Planner on Papa's Hetzner VM

Written so Papa-in-six-months can follow it cold.

## Shape

Two Docker containers (`api`, `web`) on the VM, `docker-compose.yml` at the repo root. **No Caddy container** — this VM already runs a host-level Caddy (systemd service, `/etc/caddy/Caddyfile`) in front of several other apps (lara-trust-*, app-*, bio-authn, etc.), so trip-planner gets one more site block appended to that same file instead of its own reverse proxy.

There's no GitHub remote for this repo (it's a local family project), so code gets onto the VM via `rsync` from your Mac, not `git pull`.

- VM: `77.42.46.176`, SSH as `root`
- Domain: `fam-trip.letsinvent.co.uk` (DNS must already point at the VM's IP — check that before the first deploy)
- App directory on the VM: `/opt/trip-planner`
- Internal ports (bound to `127.0.0.1` only, not exposed publicly): api `8600`→container `8000`, web `3010`→container `3000`. Chosen to avoid the other apps already running on this VM (3000/3001/4000/8000-8010/8080/8100-8500/9000/9443/50051 are all taken — see `docker ps` on the VM for the current list before picking new ports in future).

## First deploy

1. From your Mac, in the repo root:
   ```
   rsync -avz --exclude='.venv' --exclude='node_modules' --exclude='.next' \
     --exclude='crew/runs' --exclude='crew/.env' --exclude='.git' --exclude='.DS_Store' \
     ./ root@77.42.46.176:/opt/trip-planner/
   ```
   (`crew/.env` and `crew/runs` are excluded on purpose — they're VM-only state, see step 2.)

2. SSH into the VM and create the real secrets file — this never comes from your Mac, so keys never transit rsync or land in shell history there:
   ```
   ssh root@77.42.46.176
   cd /opt/trip-planner
   cp crew/.env.example crew/.env
   nano crew/.env   # fill in GROQ_API_KEY and SERPER_API_KEY
   mkdir -p crew/runs
   ```

3. Build and start:
   ```
   cd /opt/trip-planner
   docker compose build
   docker compose up -d
   docker compose ps   # both should show "healthy"/"Up"
   ```

4. Add the Caddy site block. Back up first, then append:
   ```
   cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%Y%m%d-%H%M%S)
   cat >> /etc/caddy/Caddyfile <<'EOF'

   fam-trip.letsinvent.co.uk {
       handle /api/* {
           reverse_proxy localhost:8600
       }
       handle {
           reverse_proxy localhost:3010
       }
   }
   EOF
   caddy validate --config /etc/caddy/Caddyfile
   systemctl reload caddy
   ```

5. Verify: `curl -sI https://fam-trip.letsinvent.co.uk` should return `200`, and the cert should be valid (Caddy gets this automatically from Let's Encrypt on first request to the domain).

## Update steps (after the first deploy)

```
# from your Mac
rsync -avz --exclude='.venv' --exclude='node_modules' --exclude='.next' \
  --exclude='crew/runs' --exclude='crew/.env' --exclude='.git' --exclude='.DS_Store' \
  ./ root@77.42.46.176:/opt/trip-planner/

# on the VM
ssh root@77.42.46.176
cd /opt/trip-planner && docker compose up -d --build
```

No `--delete` on the rsync — a stale file left over from a rename is harmless; accidentally deleting `crew/.env` or `crew/runs` because an exclude flag got typo'd is not. If you ever need a truly clean sync, check the exclude list twice first.

## Things to know

- **Memory is tight on this VM** (3.7G total, shared with the lara-trust and app-* stacks — often only ~1G "available" at any time). `api` is capped at 512M / 1 CPU, `web` at 256M / 0.5 CPU in `docker-compose.yml`. If the app OOMs, that's the first thing to check (`docker stats`) before raising limits.
- `guards.py`'s daily LLM-call counter assumes a single process — don't scale `api` past 1 replica or bump `--workers` above 1.
- Secrets (`crew/.env`) live only on the VM, mounted read-only into the `api` container. Never in the image, never in this repo.
- Job history and the daily counter live in `crew/runs/` on the VM host, bind-mounted into the container — they survive `docker compose down`/`up` and VM reboots as long as `/opt/trip-planner/crew/runs` isn't deleted.

## Launch checklist (run once, after first deploy)

1. Full happy-path plan generated on the live URL from a phone on mobile data (not home wifi).
2. Robots-napping path: temporarily set `DAILY_LLM_CALL_LIMIT` low in `crew/guards.py`, redeploy, trigger the 429, confirm the UI shows the robots-napping screen — then set it back and redeploy again.
3. `systemctl restart docker` (or reboot the VM) → `docker compose ps` shows both containers back up on their own; a previously-finished job ID still resolves (counter/job history survived).
4. `curl -I http://fam-trip.letsinvent.co.uk` redirects to `https://` (Caddy does this automatically).
5. Update `CLAUDE.md`: phase 3 done, add the live URL.

Then the launch itself is the family's job, not Claude Code's: the kids send the link to the family WhatsApp group.
