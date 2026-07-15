"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PipMascot } from "@/components/pip/pip-mascot";
import { DayCard } from "@/components/pip/day-card";
import type { TripPlan } from "@/lib/types";

export function ResultsScreen({ plan, onPlanAnother }: { plan: TripPlan; onPlanAnother: () => void }) {
  const [packed, setPacked] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      {/* Theme v1.1: badge now lives in CandyHeader on every screen, so it
          isn't repeated here — just the destination title. */}
      <h1 className="text-3xl font-bold text-navy text-center">{plan.destination}</h1>

      <div className="w-full max-w-md flex flex-col gap-4">
        {plan.days.map((day) => (
          <DayCard key={day.day_number} day={day} />
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Packing list</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {plan.packing_list_kids.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-navy">
                <Checkbox
                  checked={!!packed[item]}
                  onCheckedChange={(checked) =>
                    setPacked((p) => ({ ...p, [item]: checked === true }))
                  }
                />
                <span className={packed[item] ? "line-through text-muted-foreground" : ""}>
                  {item}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-navy">{plan.budget_summary}</p>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-lg bg-sunshine/20 p-4">
          <PipMascot size="sm" />
          <div className="relative rounded-lg bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-navy">{plan.pip_says}</p>
          </div>
        </div>

        <Button variant="pill" size="xl" onClick={onPlanAnother}>
          Plan another trip
        </Button>
      </div>
    </div>
  );
}
