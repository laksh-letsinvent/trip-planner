"""FastAPI wrapper around crew/. Imports crew/'s modules directly rather
than shelling out to a subprocess — the job needs a real TripPlan object
and per-task stage callbacks, and a direct import keeps that as normal
Python control flow instead of scraping stdout/files. This also matches
the phase-3 deploy shape: API + crew live in the same container, not
separate services (see build-plan.md's Docker Compose layout: api + web
+ Caddy, no separate crew service).
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

CREW_DIR = Path(__file__).parent.parent / "crew"
sys.path.insert(0, str(CREW_DIR))

# GROQ_API_KEY / SERPER_API_KEY live in crew/.env, not a second copy here —
# this service reuses the crew's keys rather than duplicating secrets.
load_dotenv(CREW_DIR / ".env")

from guards import daily_budget_ok  # noqa: E402
from runner import PlanRunError, run_plan  # noqa: E402

from jobs import create_job, get_job, update_job  # noqa: E402
from schemas import JobResponse, JobStatusResponse, PlanRequest  # noqa: E402

WEB_ORIGIN = os.getenv("WEB_ORIGIN", "http://localhost:3000")

app = FastAPI(title="Magic Trip Planner API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEB_ORIGIN],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _run_job(job_id: str, request: PlanRequest) -> None:
    update_job(job_id, status="running", stage="scout")

    def on_stage_change(stage: str) -> None:
        update_job(job_id, stage=stage)

    try:
        plan, _call_count = run_plan(
            destination=request.destination,
            days=request.days,
            kids_ages=request.kids_ages,
            budget_per_day=request.budget_per_day,
            energy=request.energy,
            on_stage_change=on_stage_change,
        )
    except PlanRunError as exc:
        update_job(job_id, status="failed", error=str(exc))
        return

    update_job(job_id, status="done", stage="planner", result=plan.model_dump())


@app.post("/api/plan", response_model=JobResponse)
def submit_plan(request: PlanRequest, background_tasks: BackgroundTasks) -> JobResponse:
    if not daily_budget_ok():
        raise HTTPException(status_code=429, detail={"error": "robots_napping"})

    job_id = create_job()
    background_tasks.add_task(_run_job, job_id, request)
    return JobResponse(job_id=job_id)


@app.get("/api/plan/{job_id}", response_model=JobStatusResponse)
def get_plan(job_id: str) -> JobStatusResponse:
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return JobStatusResponse(**job)
