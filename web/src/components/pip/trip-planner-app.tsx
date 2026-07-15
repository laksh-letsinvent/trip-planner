"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlanForm } from "@/components/pip/plan-form";
import { LoadingScreen } from "@/components/pip/loading-screen";
import { ResultsScreen } from "@/components/pip/results-screen";
import { RobotsNappingScreen, ApiDownScreen } from "@/components/pip/error-screens";
import { CandyHeader } from "@/components/pip/candy-header";
import { Sparkles } from "@/components/pip/sparkles";
import { getPlanStatus, RobotsNappingError, submitPlan } from "@/lib/api";
import type { PlanRequest, Stage, TripPlan } from "@/lib/types";

type Screen = "form" | "loading" | "results" | "robots_napping" | "api_down";

const POLL_INTERVAL_MS = 3000;
const MAX_CONSECUTIVE_POLL_FAILURES = 3;

export function TripPlannerApp({ thinkingMessages }: { thinkingMessages: string[] }) {
  const [screen, setScreen] = useState<Screen>("form");
  const [stage, setStage] = useState<Stage | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const pollFailures = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  function reset() {
    stopPolling();
    pollFailures.current = 0;
    setStage(null);
    setPlan(null);
    setScreen("form");
  }

  function pollJob(jobId: string) {
    pollTimer.current = setInterval(async () => {
      try {
        const status = await getPlanStatus(jobId);
        pollFailures.current = 0;
        setStage(status.stage);

        if (status.status === "done" && status.result) {
          stopPolling();
          setPlan(status.result);
          setScreen("results");
        } else if (status.status === "failed") {
          stopPolling();
          setScreen("api_down");
        }
      } catch {
        pollFailures.current += 1;
        if (pollFailures.current >= MAX_CONSECUTIVE_POLL_FAILURES) {
          stopPolling();
          setScreen("api_down");
        }
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleSubmit(request: PlanRequest) {
    try {
      const jobId = await submitPlan(request);
      pollFailures.current = 0;
      setStage(null);
      setScreen("loading");
      pollJob(jobId);
    } catch (err) {
      if (err instanceof RobotsNappingError) {
        setScreen("robots_napping");
      } else {
        setScreen("api_down");
      }
    }
  }

  // Theme v1.1 — Big Candy Header on every screen (Pip-less + slim on the
  // form screen, since the big centre Pip already lives there). Sparkles
  // only on form/loading/results — the build prompt's restraint rule keeps
  // them off the error screens so a bad-news moment doesn't feel festive.
  const showSparkles = screen === "form" || screen === "loading" || screen === "results";

  return (
    <>
      <CandyHeader showPip={screen !== "form"} />
      {showSparkles && <Sparkles />}
      {screen === "loading" && <LoadingScreen stage={stage} thinkingMessages={thinkingMessages} />}
      {screen === "results" && plan && <ResultsScreen plan={plan} onPlanAnother={reset} />}
      {screen === "robots_napping" && <RobotsNappingScreen onRetry={reset} />}
      {screen === "api_down" && <ApiDownScreen onRetry={reset} />}
      {screen === "form" && <PlanForm onSubmit={handleSubmit} />}
    </>
  );
}
