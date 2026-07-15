"""Runs the three-agent crew end to end. Shared by the CLI (main.py) and
the API (api/main.py) so the Groq workarounds, task pacing, and stage
tracking only live in one place."""

import time
from collections.abc import Callable

from agents import make_family_filter, make_planner, make_scout
from guards import TASK_PACING_SECONDS, make_call_counter
from models import TripPlan
from patches import disable_prompt_cache_tagging
from tasks import build_tasks

STAGES = ["scout", "family_filter", "planner"]


class PlanRunError(Exception):
    """The crew failed, or the Planner's output never validated. Callers
    should surface this, never fabricate a plan to paper over it."""


def run_plan(
    *,
    destination: str,
    days: int,
    kids_ages: list[int],
    budget_per_day: int,
    energy: str,
    on_stage_change: Callable[[str], None] | None = None,
    on_pacing_wait: Callable[[], None] | None = None,
    pace: bool = True,
) -> tuple[TripPlan, int]:
    """Returns (plan, llm_call_count). Raises PlanRunError on failure."""
    from crewai import Crew, Process

    disable_prompt_cache_tagging()

    scout = make_scout()
    family_filter = make_family_filter()
    planner = make_planner()

    tasks = build_tasks(
        scout,
        family_filter,
        planner,
        destination=destination,
        days=days,
        kids_ages=kids_ages,
        budget_per_day=budget_per_day,
        energy=energy,
    )

    count_call, run_calls = make_call_counter()
    if on_stage_change:
        on_stage_change(STAGES[0])
    finished = {"count": 0}

    def task_callback(task_output) -> None:
        count_call(task_output)
        finished["count"] += 1
        if finished["count"] < len(tasks):
            if pace:
                if on_pacing_wait:
                    on_pacing_wait()
                time.sleep(TASK_PACING_SECONDS)
            if on_stage_change:
                on_stage_change(STAGES[finished["count"]])

    crew = Crew(
        agents=[scout, family_filter, planner],
        tasks=tasks,
        process=Process.sequential,
        task_callback=task_callback,
        verbose=True,
        tracing=False,
    )

    try:
        result = crew.kickoff()
    except Exception as exc:  # network down, bad key, exhausted retries, etc.
        raise PlanRunError(str(exc)) from exc

    plan = result.pydantic
    if plan is None:
        raise PlanRunError("The Planner's output didn't validate and retries were exhausted.")

    return plan, run_calls["count"]
