"""Free-tier guardrails: a search budget per plan, and a daily LLM request
counter so we degrade politely instead of blowing through Groq/Serper limits."""

import json
from datetime import date, datetime
from pathlib import Path

from crewai_tools import SerperDevTool

COUNTER_PATH = Path(__file__).parent / "runs" / "counter.json"
DAILY_LLM_CALL_LIMIT = 1000
MAX_SEARCHES_PER_PLAN = 5

# Groq's free-tier tokens-per-minute cap is a rolling 60s window, and some
# accounts see it as low as 6,000 TPM — easy to blow through by chaining
# three back-to-back agent calls. A short pause between tasks lets the
# window recover instead of us needing our own token-accounting system.
TASK_PACING_SECONDS = 20


class BudgetedSearchTool(SerperDevTool):
    """SerperDevTool capped at MAX_SEARCHES_PER_PLAN calls. Once spent, the
    agent gets a friendly nudge to work with what it already has, instead of
    a dead-end error. n_results is kept small because llama-3.1-8b-instant's
    free-tier TPM cap (as low as 6,000 on some Groq accounts) is easy to blow
    through with a handful of full-size search result sets in context."""

    max_usage_count: int = MAX_SEARCHES_PER_PLAN
    n_results: int = 3

    def _claim_usage(self) -> str | None:
        limit_error = super()._claim_usage()
        if limit_error:
            return "search budget used up — work with what you have"
        return None


def _load_counter() -> dict:
    if not COUNTER_PATH.exists():
        return {}
    try:
        return json.loads(COUNTER_PATH.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _save_counter(counter: dict) -> None:
    COUNTER_PATH.parent.mkdir(parents=True, exist_ok=True)
    COUNTER_PATH.write_text(json.dumps(counter, indent=2))


def today_call_count() -> int:
    counter = _load_counter()
    return counter.get(str(date.today()), 0)


def daily_budget_ok() -> bool:
    """True if today's LLM call count is still under the free-tier limit."""
    return today_call_count() < DAILY_LLM_CALL_LIMIT


def make_call_counter():
    """Returns a step_callback that increments today's LLM call count on
    every agent step, and a getter for the running total this run."""
    run_calls = {"count": 0}

    def step_callback(_step_output) -> None:
        run_calls["count"] += 1
        counter = _load_counter()
        key = str(date.today())
        counter[key] = counter.get(key, 0) + 1
        counter["last_updated"] = datetime.now().isoformat(timespec="seconds")
        _save_counter(counter)

    return step_callback, run_calls
