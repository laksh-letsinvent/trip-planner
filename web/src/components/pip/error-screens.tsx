"use client";

import { Button } from "@/components/ui/button";
import { PipMascot } from "@/components/pip/pip-mascot";

function ErrorScreen({
  emoji,
  title,
  message,
  buttonLabel,
  onRetry,
}: {
  emoji: string;
  title: string;
  message: string;
  buttonLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <PipMascot size="lg" />
      <span className="text-5xl" aria-hidden="true">
        {emoji}
      </span>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="max-w-xs text-navy/80">{message}</p>
      <Button variant="pill" size="xl" onClick={onRetry}>
        {buttonLabel}
      </Button>
    </div>
  );
}

export function RobotsNappingScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorScreen
      emoji="🤖💤"
      title="The robots are napping"
      message="Pip's crew has done enough planning for today! Come back tomorrow for more adventures."
      buttonLabel="Back to start"
      onRetry={onRetry}
    />
  );
}

export function ApiDownScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorScreen
      emoji="🐧💭"
      title="Pip lost the map!"
      message="Something went wrong reaching the crew. Check your connection and try again."
      buttonLabel="Try again"
      onRetry={onRetry}
    />
  );
}
