"""The plan's output contract. Every day MUST have a rainy-day Plan B —
that's not a nice-to-have, it's why this app exists. Pydantic enforces it."""

from typing import Literal

from pydantic import BaseModel, Field


class Activity(BaseModel):
    name: str
    why_kids_like_it: str
    rough_cost_gbp: str  # "free", "~£20 family", etc.
    walking_effort: Literal["easy", "medium", "lots"]


class DayPlan(BaseModel):
    day_number: int
    theme: str  # e.g. "Beach + ice cream day"
    morning: Activity
    afternoon: Activity
    evening: str  # low-key, one line
    plan_b_rainy: Activity  # REQUIRED — the whole point of the product
    ice_cream_stops: int = Field(ge=1)  # ice cream is load-bearing infrastructure
    food_note: str  # where favourite-food needs are met today


class TripPlan(BaseModel):
    destination: str
    days: list[DayPlan]
    packing_list_kids: list[str] = Field(min_length=8, max_length=12)
    budget_summary: str
    pip_says: str  # one cheerful sign-off line from Pip the Penguin
