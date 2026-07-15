"""In-memory job store, mirrored to crew/runs/jobs.json so a restart
doesn't 404 jobs that already finished. No database — family traffic
doesn't need one (see CLAUDE.md)."""

import json
import threading
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

JOBS_PATH = Path(__file__).parent.parent / "crew" / "runs" / "jobs.json"

_lock = threading.Lock()
_jobs: dict[str, dict[str, Any]] = {}


def _load() -> None:
    if not JOBS_PATH.exists():
        return
    try:
        _jobs.update(json.loads(JOBS_PATH.read_text()))
    except (json.JSONDecodeError, OSError):
        pass


def _save() -> None:
    JOBS_PATH.parent.mkdir(parents=True, exist_ok=True)
    JOBS_PATH.write_text(json.dumps(_jobs, indent=2))


_load()


def create_job() -> str:
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {
            "status": "queued",
            "stage": None,
            "result": None,
            "error": None,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        _save()
    return job_id


def update_job(job_id: str, **fields: Any) -> None:
    with _lock:
        if job_id not in _jobs:
            return
        _jobs[job_id].update(fields)
        _save()


def get_job(job_id: str) -> dict[str, Any] | None:
    with _lock:
        return _jobs.get(job_id)
