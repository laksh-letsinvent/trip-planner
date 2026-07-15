import { TripPlannerApp } from "@/components/pip/trip-planner-app";
import { loadThinkingMessages } from "@/lib/thinking-messages";

export default function Home() {
  const thinkingMessages = loadThinkingMessages();
  return (
    <div className="flex flex-1 flex-col">
      <TripPlannerApp thinkingMessages={thinkingMessages} />
    </div>
  );
}
