import { cn } from "@/lib/utils";

// Theme v1.1 — Big Candy Header. Teal band + one gentle wave on every
// screen. Pip peeks over the wave everywhere except home (the big centre
// Pip already lives there — two Pips on one screen is one Pip too many).
//
// Badge placement is Papa's proposed answer to the open question in
// docs/theme-glow-up-options.md — flag for the Chief Designer at the demo.
export function CandyHeader({ showPip = true }: { showPip?: boolean }) {
  return (
    <header className="relative w-full shrink-0">
      <div
        className={cn(
          "flex w-full items-center gap-3 bg-teal px-4",
          showPip ? "h-20" : "h-14"
        )}
      >
        <img
          src="/pip-logo.png"
          alt="Pip the Penguin badge"
          className="h-10 w-10 object-contain drop-shadow-sm"
        />
        <span className="text-outline-navy font-heading text-xl font-bold text-white">
          Magic Trip Planner
        </span>
      </div>

      {/* One gentle wave, not a rollercoaster. */}
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="block h-6 w-full"
        aria-hidden="true"
      >
        <path d="M0,0 C 360,48 1080,48 1440,0 L1440,0 L0,0 Z" fill="var(--teal)" />
      </svg>

      {showPip && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full h-10 w-16 -translate-x-1/2 -translate-y-6 overflow-hidden"
        >
          <img
            src="/pip-mascot.png"
            alt=""
            className="h-16 w-16 object-contain object-top drop-shadow-md"
          />
        </div>
      )}
    </header>
  );
}
