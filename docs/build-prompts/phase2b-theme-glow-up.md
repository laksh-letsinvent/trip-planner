# BUILD PROMPT — Phase 2b: Theme Glow-Up (Candy Sky + Sticker Party + Big Candy Header)

> Paste below the line into Claude Code from the repo root. Prerequisite: phase 2 done and running locally. Read `CLAUDE.md`, `DESIGN.md`, and `docs/theme-glow-up-options.md` first.

---

Punch up the Magic Trip Planner's visual theme by combining all three options from `docs/theme-glow-up-options.md`: A (Candy Sky), B (Sticker Party), C (Big Candy Header). Papa has called the combination; the Chief Designer (11) ratifies it at the weekend demo, so everything here must stay faithful to her Candy Pop tokens in `DESIGN.md` — same five hexes, no new colours beyond pale tints derived from them.

## How the three combine (visual hierarchy, so it's a look, not soup)

Bottom layer: Candy Sky gradient page background. Top of every screen: the teal wave header. Floating on the sky: white sticker cards with navy outlines. Sparkles used sparingly at the page edges. Restraint rule: if a screen starts feeling like a sticker explosion, the cards win and the sparkles lose.

## A — Candy Sky background

- Replace the flat white `--background` with a soft vertical gradient: very pale candy-pink (~`#FFF1F4`) at the top melting into very pale sunshine (~`#FFFBEB`) at the bottom. Fixed attachment so it doesn't scroll-band.
- Cards, popovers, inputs stay white — they float on the sky.
- Check every screen: text contrast must not drop anywhere (navy on pale tints is fine; verify muted-foreground).

## B — Sticker Party

- Cards: `border-2` navy outline + a sticker shadow (small offset solid shadow, e.g. `4px 4px 0` navy at low opacity) instead of the soft blur shadow. 16px radius stays.
- Primary/secondary pill buttons: same 2px navy outline treatment; keep existing fills.
- Chips/badges: 2px navy outline and a tiny alternating tilt (−2° / +1.5° via nth-child) like they were stuck on by hand.
- Sparkles: one small decorative `<Sparkles />` component — 4–6 tiny star SVGs (sunshine yellow + teal, navy outline) absolutely positioned near page corners/edges. `aria-hidden`, `pointer-events-none`, gentle twinkle animation, fully disabled under `prefers-reduced-motion`. Used on form, loading, and results screens only.
- All of this must visually rhyme with Pip's art (thick clean outlines, flat colour) — his linework is the style reference.

## C — Big Candy Header

- New `<CandyHeader />` component on every screen: full-width teal band with an SVG wave as its bottom edge (one gentle wave, not a rollercoaster).
- Contents: the "PIP THE PENGUIN" badge (`/pip-logo.png`, ~h-10) on the left — this is the proposed answer to the open badge-placement question, flag it for the Chief Designer at the demo. App name "Magic Trip Planner" next to it in Baloo 2, white.
- Pip peeks over the wave's edge (bottom-cropped `/pip-mascot.png`, overlapping the wave) on loading, results, and error screens. NOT on the home screen — the big centre Pip already lives there, and two Pips on one screen is one Pip too many. On home, the header is slimmer and Pip-less.
- Navy text/white text on teal: check contrast, white with the navy-outlined badge should carry it.

## Rules

- Touch only `web/` — no API or crew changes.
- All colour values via the CSS variables in `globals.css`; derived pale tints get their own named variables (`--sky-top`, `--sky-bottom`) with a comment pointing at DESIGN.md.
- Keep components readable — the Chief Designer will be shown this code. Comments in plain English.
- After implementing, add a clearly-marked section to `DESIGN.md`: "## Theme v1.1 — Candy Sky + Sticker Party + Candy Header (proposed by Papa, awaiting Chief Designer sign-off)" with one line per change. Do NOT edit her existing sections.
- Update `CLAUDE.md` phase status (2b built, pending Chief Designer ratification at demo).

## Acceptance

1. Every screen (form, loading, results, robots-napping, api-down) shows: sky gradient, wave header, sticker cards. No flat-white page anywhere.
2. Home shows exactly one Pip; loading/results/errors show him peeking over the wave.
3. Chips are tilted, cards have navy outlines, sparkles twinkle — and stop twinkling with `prefers-reduced-motion: reduce`.
4. Everything still passes at 375px width; nothing overflows horizontally.
5. Squint test against `DESIGN.md` hexes: only the five Candy Pop colours + their two pale tints anywhere.
6. `next build` passes clean.

Then book the real gate: Chief Designer reviews screen by screen. If she vetoes any piece, that piece reverts — her file, her call. After her sign-off (and the About-page names decision), you're clear for `phase3-ship.md`.
