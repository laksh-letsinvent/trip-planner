import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-12",
  md: "size-20",
  lg: "size-32",
} as const;

// Pip the Penguin — the real deal! Art by the Chief Designer (Recraft pass
// on her hand-drawn sketch, see DESIGN.md), background stripped so Pip can
// stand on any colour. Plain <img> on purpose: it's a small static PNG in
// /public, next/image optimisation would be jewellery here.
export function PipMascot({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <img
      src="/pip-mascot.png"
      alt="Pip the Penguin waving, holding a little planner card"
      className={cn("object-contain drop-shadow-md", SIZES[size], className)}
    />
  );
}
