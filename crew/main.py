"""CLI entrypoint for the Magic Trip Planner crew.

    uv run python main.py --destination "Lisbon" --days 5 --kids-ages 11 6 \\
        --budget-per-day 150 --energy medium [--dry-run]
"""

import argparse
import json
import random
import re
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

CREW_DIR = Path(__file__).parent
DESIGN_MD_PATH = CREW_DIR.parent / "DESIGN.md"
PERSONA_PATH = CREW_DIR / "personas" / "family_filter.md"
RUNS_DIR = CREW_DIR / "runs"

console = Console()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Plan a family holiday with Pip the Penguin's crew.")
    parser.add_argument("--destination", required=True)
    parser.add_argument("--days", type=int, required=True)
    parser.add_argument("--kids-ages", type=int, nargs="+", required=True)
    parser.add_argument("--budget-per-day", type=int, required=True)
    parser.add_argument("--energy", choices=["low", "medium", "high"], required=True)
    parser.add_argument("--dry-run", action="store_true", help="Print resolved config, zero API calls.")
    return parser.parse_args()


def load_thinking_messages() -> list[str]:
    """Pull the 6-year-old's thinking-messages straight out of DESIGN.md so
    she can add more there without anyone touching Python."""
    if not DESIGN_MD_PATH.exists():
        return ["Pip is thinking..."]
    text = DESIGN_MD_PATH.read_text()
    match = re.search(r"## Funny thinking-messages.*?\n(.*?)(?:\n##|\Z)", text, re.DOTALL)
    if not match:
        return ["Pip is thinking..."]
    lines = re.findall(r'^- "(.+?)"', match.group(1), re.MULTILINE)
    return lines or ["Pip is thinking..."]


def print_banner() -> None:
    console.print(
        Panel.fit(
            "🐧 [bold]Magic Trip Planner[/bold]\n[italic]Leave the planning to Pip![/italic]",
            border_style="magenta",
        )
    )


def print_dry_run(args: argparse.Namespace) -> None:
    console.print("[bold yellow]--dry-run: no API calls will be made[/bold yellow]\n")

    table = Table(title="Resolved config")
    table.add_column("Setting")
    table.add_column("Value")
    table.add_row("Destination", args.destination)
    table.add_row("Days", str(args.days))
    table.add_row("Kids' ages", ", ".join(str(a) for a in args.kids_ages))
    table.add_row("Budget/day", f"£{args.budget_per_day}")
    table.add_row("Energy", args.energy)
    console.print(table)

    console.print("\n[bold]Model:[/bold] groq/llama-3.1-8b-instant (all three agents)")
    console.print("[bold]Tools:[/bold] SerperDevTool (Scout only, capped at 5 searches/plan)")

    console.print("\n[bold]Persona file (personas/family_filter.md):[/bold]")
    if PERSONA_PATH.exists():
        console.print(Panel(PERSONA_PATH.read_text(), border_style="cyan"))
    else:
        console.print("[red]Missing — expected at personas/family_filter.md[/red]")

    console.print(f"\n[bold]Thinking-messages loaded from DESIGN.md:[/bold] {len(load_thinking_messages())} found")


def run_crew(args: argparse.Namespace) -> None:
    # Imports that need GROQ_API_KEY/crewai deps live inside here so
    # --dry-run works even with no .env and a bare-bones install.
    from guards import daily_budget_ok, today_call_count
    from runner import STAGES, PlanRunError, run_plan

    if not daily_budget_ok():
        console.print("[bold]🤖💤 The robots are napping — try tomorrow![/bold]")
        sys.exit(0)

    thinking_messages = load_thinking_messages()
    console.print(f"[dim]{random.choice(thinking_messages)}[/dim]\n")

    stage_names = {"scout": "Scout", "family_filter": "Family Filter", "planner": "Planner"}
    stage_colours = {"scout": "green", "family_filter": "cyan", "planner": "magenta"}

    def on_stage_change(stage: str) -> None:
        colour = stage_colours[stage]
        console.print(f"[bold {colour}]-> {stage_names[stage]} is starting...[/bold {colour}]")

    def on_pacing_wait() -> None:
        console.print(f"[dim]...letting the free tier catch its breath ({random.choice(thinking_messages)})[/dim]")

    try:
        plan, call_count = run_plan(
            destination=args.destination,
            days=args.days,
            kids_ages=args.kids_ages,
            budget_per_day=args.budget_per_day,
            energy=args.energy,
            on_stage_change=on_stage_change,
            on_pacing_wait=on_pacing_wait,
        )
    except PlanRunError as exc:
        console.print(f"[bold red]Something went wrong:[/bold red] {exc}")
        console.print("[dim]Groq didn't answer, or a task ran out of retries — check GROQ_API_KEY in .env?[/dim]")
        sys.exit(1)

    print_plan(plan)
    save_run(plan)

    console.print(
        f"\n[bold]Used {call_count} LLM calls this run. "
        f"Today's total: {today_call_count()}. Free tier: plenty left.[/bold]"
    )


def print_plan(plan) -> None:
    console.print(Panel.fit(f"[bold]{plan.destination}[/bold]", border_style="green"))

    for day in plan.days:
        table = Table(title=f"Day {day.day_number}: {day.theme}", show_header=True)
        table.add_column("Slot")
        table.add_column("Activity")
        table.add_column("Cost")
        table.add_column("Walking")
        table.add_row("Morning", day.morning.name, day.morning.rough_cost_gbp, day.morning.walking_effort)
        table.add_row("Afternoon", day.afternoon.name, day.afternoon.rough_cost_gbp, day.afternoon.walking_effort)
        table.add_row("Evening", day.evening, "-", "-")
        table.add_row(
            "[yellow]Plan B (rainy)[/yellow]",
            f"[yellow]{day.plan_b_rainy.name}[/yellow]",
            day.plan_b_rainy.rough_cost_gbp,
            day.plan_b_rainy.walking_effort,
        )
        console.print(table)
        console.print(f"🍦 Ice cream stops: {day.ice_cream_stops}  |  🍽️ {day.food_note}\n")

    console.print(Panel(", ".join(plan.packing_list_kids), title="Packing list"))
    console.print(Panel(plan.budget_summary, title="Budget"))
    console.print(Panel.fit(f"🐧 {plan.pip_says}", border_style="magenta"))


def save_run(plan) -> Path:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_path = RUNS_DIR / f"plan-{timestamp}.json"
    out_path.write_text(json.dumps(plan.model_dump(), indent=2))
    console.print(f"[dim]Saved to {out_path.relative_to(CREW_DIR.parent)}[/dim]")
    return out_path


def main() -> None:
    load_dotenv()
    args = parse_args()
    print_banner()

    if args.dry_run:
        print_dry_run(args)
        return

    run_crew(args)


if __name__ == "__main__":
    main()
