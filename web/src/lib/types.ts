// Mirrors crew/models.py and api/schemas.py — keep in sync by hand, there's
// no codegen step for a project this size.

export type WalkingEffort = "easy" | "medium" | "lots";
export type EnergyLevel = "low" | "medium" | "high";
export type Stage = "scout" | "family_filter" | "planner";
export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Activity {
  name: string;
  why_kids_like_it: string;
  rough_cost_gbp: string;
  walking_effort: WalkingEffort;
}

export interface DayPlan {
  day_number: number;
  theme: string;
  morning: Activity;
  afternoon: Activity;
  evening: string;
  plan_b_rainy: Activity;
  ice_cream_stops: number;
  food_note: string;
}

export interface TripPlan {
  destination: string;
  days: DayPlan[];
  packing_list_kids: string[];
  budget_summary: string;
  pip_says: string;
}

export interface PlanRequest {
  destination: string;
  days: number;
  kids_ages: number[];
  budget_per_day: number;
  energy: EnergyLevel;
}

export interface JobStatusResponse {
  status: JobStatus;
  stage: Stage | null;
  result: TripPlan | null;
  error: string | null;
}
