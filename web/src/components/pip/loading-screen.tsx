"use client";

import { useEffect, useState } from "react";
import { PipMascot } from "@/components/pip/pip-mascot";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";

const AGENTS: { stage: Stage; name: string; emoji: string }[] = [
  { stage: "scout", name: "Scout", emoji: "🔭" },
  { stage: "family_filter", name: "Family Filter", emoji: "🧡" },
  { stage: "planner", name: "Planner", emoji: "🗺️" },
];

export function LoadingScreen({
  stage,
  thinkingMessages,
}: {
  stage: Stage | null;
  thinkingMessages: string[];
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % thinkingMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [thinkingMessages.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <PipMascot size="lg" className="animate-bounce" />

      <div className="flex gap-4">
        {AGENTS.map((agent) => {
          const isActive = agent.stage === stage;
          return (
            <div
              key={agent.stage}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all",
                isActive ? "bg-teal/20 scale-110" : "opacity-50"
              )}
            >
              <span className={cn("text-3xl", isActive && "animate-pulse")}>{agent.emoji}</span>
              <span className="text-xs font-heading font-semibold text-navy">{agent.name}</span>
              {isActive && <span className="text-[10px] text-teal">talking...</span>}
            </div>
          );
        })}
      </div>

      <p className="max-w-xs text-navy/80 font-medium min-h-12">
        {thinkingMessages[messageIndex]}
      </p>
    </div>
  );
}
