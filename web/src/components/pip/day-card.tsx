"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity, DayPlan } from "@/lib/types";

function ActivityRow({ label, activity }: { label: string; activity: Activity }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-heading font-semibold uppercase text-teal">{label}</span>
      <p className="font-medium text-navy">{activity.name}</p>
      <p className="text-sm text-muted-foreground">{activity.why_kids_like_it}</p>
      <div className="flex gap-2">
        <Badge variant="chip">{activity.rough_cost_gbp}</Badge>
        <Badge variant="chip">🚶 {activity.walking_effort}</Badge>
      </div>
    </div>
  );
}

export function DayCard({ day }: { day: DayPlan }) {
  const [showPlanB, setShowPlanB] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Day {day.day_number}: {day.theme}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ActivityRow label="Morning" activity={day.morning} />
        <ActivityRow label="Afternoon" activity={day.afternoon} />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-heading font-semibold uppercase text-teal">Evening</span>
          <p className="text-sm text-navy">{day.evening}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="chip">🍦 x{day.ice_cream_stops}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">🍽️ {day.food_note}</p>

        <button
          type="button"
          onClick={() => setShowPlanB((v) => !v)}
          className="text-left rounded-lg border border-candy-pink/40 bg-candy-pink/5 px-3 py-2 text-sm font-heading font-semibold text-candy-pink"
        >
          ☔ If it rains… {showPlanB ? "▲" : "▼"}
        </button>
        {showPlanB && (
          <div className="rounded-lg border border-candy-pink/20 bg-candy-pink/5 p-3">
            <ActivityRow label="Plan B" activity={day.plan_b_rainy} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
