// Theme v1.1 — Sticker Party sparkles. Purely decorative, so: aria-hidden,
// pointer-events-none, and the twinkle animation turns off under
// prefers-reduced-motion (see .animate-twinkle in globals.css). Used on
// form, loading, and results screens only — restraint rule from the build
// prompt: if a screen starts feeling like a sticker explosion, the cards
// win and the sparkles lose.

function Star({ color, className, delay }: { color: string; className?: string; delay?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <path
        d="M12 1 L14.5 9 L23 12 L14.5 15 L12 23 L9.5 15 L1 12 L9.5 9 Z"
        fill={color}
        stroke="var(--navy)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SPARKLES = [
  { color: "var(--sunshine)", size: "size-5", pos: "left-3 top-20", delay: "0s" },
  { color: "var(--teal)", size: "size-4", pos: "right-4 top-32", delay: "0.5s" },
  { color: "var(--sunshine)", size: "size-3", pos: "left-5 bottom-40", delay: "1s" },
  { color: "var(--teal)", size: "size-5", pos: "right-3 bottom-24", delay: "1.5s" },
  { color: "var(--sunshine)", size: "size-4", pos: "right-6 top-1/2", delay: "0.8s" },
] as const;

export function Sparkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {SPARKLES.map((s, i) => (
        <Star
          key={i}
          color={s.color}
          delay={s.delay}
          className={`animate-twinkle absolute ${s.pos} ${s.size}`}
        />
      ))}
    </div>
  );
}
