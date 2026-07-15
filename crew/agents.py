"""The three agents: Scout -> Family Filter -> Planner (Process.sequential).

Model: Groq llama-3.1-8b-instant — most free-tier headroom (~14.4k req/day,
500k tokens/day). NOTE: Groq is deprecating this model on 2026-08-16;
recommended swap is groq/openai-gpt-oss-20b (as `openai/gpt-oss-20b` on
Groq's model list) — check https://console.groq.com/docs/models before that
date and update MODEL below if it's gone.
"""

from pathlib import Path

from crewai import LLM, Agent

from guards import BudgetedSearchTool

MODEL = "groq/llama-3.1-8b-instant"
# build-plan.md's pre-agreed decision point: "8B writes mediocre itineraries
# or breaks JSON -> swap Planner (only) to llama-3.3-70b-versatile." Hit
# during phase-1 testing: 8B's native tool-calling misplaced a closing brace
# in the nested TripPlan schema, dropping pip_says outside the object.
PLANNER_MODEL = "groq/llama-3.3-70b-versatile"
PERSONA_PATH = Path(__file__).parent / "personas" / "family_filter.md"


def _llm(model: str = MODEL) -> LLM:
    return LLM(model=model)


def make_scout() -> Agent:
    return Agent(
        role="Scout",
        goal="Research family-friendly things to do at the destination for the given dates",
        backstory=(
            "You're a well-travelled scout who knows how to find things families "
            "with kids actually enjoy, not just the top tourist checklist. You care "
            "about weather, indoor backups, and rough costs as much as the big-ticket "
            "attractions."
        ),
        tools=[BudgetedSearchTool()],
        llm=_llm(),
        verbose=True,
    )


def make_family_filter() -> Agent:
    persona = PERSONA_PATH.read_text()
    return Agent(
        role="Family Filter",
        goal="Rewrite the Scout's research through the family's own rules, cutting or fixing anything BORING",
        backstory=persona,
        llm=_llm(),
        verbose=True,
    )


def make_planner() -> Agent:
    return Agent(
        role="Planner",
        goal=(
            "Turn the filtered research into a structured day-by-day trip plan. "
            "Every single day MUST include a rainy-day Plan B activity — this is "
            "non-negotiable, the plan is invalid without it."
        ),
        backstory=(
            "You're a meticulous family trip planner. You never skip the rainy-day "
            "backup, you always find at least one ice cream stop per day, and you "
            "keep a running eye on the daily budget."
        ),
        llm=_llm(PLANNER_MODEL),
        verbose=True,
    )
