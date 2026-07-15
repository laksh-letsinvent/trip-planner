"""Request/response contracts for the plan job API."""

from typing import Literal

from pydantic import BaseModel, Field

Stage = Literal["scout", "family_filter", "planner"]
JobStatus = Literal["queued", "running", "done", "failed"]


class PlanRequest(BaseModel):
    destination: str
    days: int = Field(gt=0, le=14)
    kids_ages: list[int] = Field(min_length=1)
    budget_per_day: int = Field(gt=0)
    energy: Literal["low", "medium", "high"]


class JobResponse(BaseModel):
    job_id: str


class JobStatusResponse(BaseModel):
    status: JobStatus
    stage: Stage | None = None
    result: dict | None = None
    error: str | None = None
