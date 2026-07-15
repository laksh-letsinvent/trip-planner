"""The three tasks matching the three agents. build_tasks() fills in the
trip config (destination, dates, kids, budget, energy) for one run."""

from typing import Any

from crewai import Agent, Task
from crewai.tasks.task_output import TaskOutput

from models import TripPlan


def _validate_trip_plan(output: TaskOutput) -> tuple[bool, Any]:
    """Guardrail for the Planner task. Pydantic already makes plan_b_rainy a
    required field, so any day missing it fails parsing here — CrewAI then
    retries the task once (guardrail_max_retries=1) with this message folded
    into the prompt. If it fails twice, CrewAI raises rather than us silently
    shipping a plan with a missing Plan B."""
    if output.pydantic is None:
        return (
            False,
            "Output did not match the TripPlan schema. Every day MUST include "
            "morning, afternoon, evening, and a plan_b_rainy activity — return "
            "valid JSON with all required fields for every day.",
        )
    return True, output.pydantic


def build_tasks(
    scout: Agent,
    family_filter: Agent,
    planner: Agent,
    *,
    destination: str,
    days: int,
    kids_ages: list[int],
    budget_per_day: int,
    energy: str,
) -> list[Task]:
    ages = ", ".join(str(a) for a in kids_ages)

    scout_task = Task(
        description=(
            f"Research {destination} for a {days}-day family holiday with kids "
            f"aged {ages}. Find: top family-friendly things to do, typical weather "
            f"for the trip, indoor/rainy-day options, and rough costs. Daily budget "
            f"is about £{budget_per_day}. Energy level for the trip: {energy}. "
            "Write your findings as a readable markdown research brief, not JSON."
        ),
        expected_output="A markdown research brief covering activities, weather, indoor options, and rough costs.",
        agent=scout,
    )

    family_filter_task = Task(
        description=(
            "Read the Scout's research brief and rewrite it through your own rules "
            f"in your persona. Kids on this trip are aged {ages}. Score every "
            "proposed activity AWESOME, OK, or BORING, and cut or fix anything BORING. "
            "Output the revised, family-approved set of activities as markdown."
        ),
        expected_output="A markdown list of family-approved activities, each with an AWESOME/OK verdict.",
        agent=family_filter,
        context=[scout_task],
    )

    planner_task = Task(
        description=(
            f"Using the family-approved activities, build the final {days}-day plan "
            f"for {destination}. Kids aged {ages}, daily budget about £{budget_per_day}, "
            f"energy level {energy}. Every day needs: a theme, a morning activity, an "
            "afternoon activity, a low-key one-line evening, a plan_b_rainy activity "
            "(REQUIRED, no exceptions), at least 1 ice cream stop, and a food_note. "
            "Also include a kid-focused packing list (8-12 items), a budget_summary, "
            "and a one-line cheerful sign-off from Pip the Penguin as pip_says."
        ),
        expected_output="A TripPlan matching the required schema exactly, with every day including plan_b_rainy.",
        agent=planner,
        context=[family_filter_task],
        output_pydantic=TripPlan,
        guardrail=_validate_trip_plan,
        guardrail_max_retries=1,
    )

    return [scout_task, family_filter_task, planner_task]
