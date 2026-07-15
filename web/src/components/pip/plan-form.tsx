"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PipMascot } from "@/components/pip/pip-mascot";
import { cn } from "@/lib/utils";
import type { EnergyLevel, PlanRequest } from "@/lib/types";

const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: "low", label: "Chilled" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Pack it in" },
];

export function PlanForm({ onSubmit }: { onSubmit: (request: PlanRequest) => void }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [kidsAges, setKidsAges] = useState<number[]>([8]);
  const [budgetPerDay, setBudgetPerDay] = useState(150);
  const [energy, setEnergy] = useState<EnergyLevel>("medium");

  const canSubmit = destination.trim().length > 0 && days > 0 && kidsAges.length > 0;

  function updateAge(index: number, value: number) {
    setKidsAges((ages) => ages.map((age, i) => (i === index ? value : age)));
  }

  function addKid() {
    setKidsAges((ages) => [...ages, 8]);
  }

  function removeKid(index: number) {
    setKidsAges((ages) => ages.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      destination: destination.trim(),
      days,
      kids_ages: kidsAges,
      budget_per_day: budgetPerDay,
      energy,
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <PipMascot size="lg" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy">Magic Trip Planner</h1>
        <p className="mt-1 text-teal font-heading font-semibold">Leave the planning to Pip!</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border-2 border-navy bg-card p-6 shadow-[var(--sticker-shadow)] flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="destination">Where are we going?</Label>
          <Input
            id="destination"
            placeholder="Lisbon, Portugal"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="days">How many days?</Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Kids&apos; ages</Label>
          <div className="flex flex-col gap-2">
            {kidsAges.map((age, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={17}
                  value={age}
                  onChange={(e) => updateAge(i, Number(e.target.value))}
                  className="max-w-24"
                />
                {kidsAges.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeKid(i)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="pill-outline" size="sm" className="self-start border" onClick={addKid}>
            + Add another kid
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="budget">Daily budget (£)</Label>
          <Input
            id="budget"
            type="number"
            min={1}
            value={budgetPerDay}
            onChange={(e) => setBudgetPerDay(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Energy level</Label>
          <div className="flex gap-2 flex-wrap">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                  energy === opt.value
                    ? "bg-sunshine text-navy border-sunshine"
                    : "bg-white text-navy border-border hover:border-sunshine"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="pill" size="xl" disabled={!canSubmit}>
          Plan our trip!
        </Button>
      </form>
    </div>
  );
}
