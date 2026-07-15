import type { JobStatusResponse, PlanRequest } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class RobotsNappingError extends Error {
  constructor() {
    super("The robots are napping — try again tomorrow!");
    this.name = "RobotsNappingError";
  }
}

export async function submitPlan(request: PlanRequest): Promise<string> {
  const res = await fetch(`${API_URL}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (res.status === 429) {
    throw new RobotsNappingError();
  }
  if (!res.ok) {
    throw new Error(`Couldn't reach Pip's crew (${res.status})`);
  }

  const data: { job_id: string } = await res.json();
  return data.job_id;
}

export async function getPlanStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_URL}/api/plan/${jobId}`);
  if (!res.ok) {
    throw new Error(`Couldn't reach Pip's crew (${res.status})`);
  }
  return res.json();
}
