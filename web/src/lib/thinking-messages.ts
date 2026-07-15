import { readFileSync } from "node:fs";
import path from "node:path";

// Mirrors crew/main.py's load_thinking_messages() — same regex, same file,
// so the CLI and the web loading screen never drift. Read at request time
// on the server so a fresh `next dev` (or a prod restart) picks up new
// lines the 6-year-old adds to DESIGN.md without any code change.
const DESIGN_MD_PATH = path.join(process.cwd(), "..", "DESIGN.md");
const FALLBACK = ["Pip is thinking..."];

export function loadThinkingMessages(): string[] {
  let text: string;
  try {
    text = readFileSync(DESIGN_MD_PATH, "utf-8");
  } catch {
    return FALLBACK;
  }

  const section = text.match(/## Funny thinking-messages[\s\S]*?\n([\s\S]*?)(?:\n##|$)/);
  if (!section) return FALLBACK;

  const lines = [...section[1].matchAll(/^- "(.+?)"/gm)].map((m) => m[1]);
  return lines.length > 0 ? lines : FALLBACK;
}
