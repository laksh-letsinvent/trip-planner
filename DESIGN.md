# DESIGN.md — Magic Trip Planner

> Owned by Laranya (11), Chief Designer. This is the canonical design spec for the app — Papa/Claude suggest, never silently overwrite. Mascot personality is co-owned with Mehar (6), Chief of Characters & Fun.

## App name
**Magic Trip Planner** — won the family vote.

## Mascot: Pip the Penguin
Catchphrase: **"Leave the planning to Pip!"**

Source art: Laranya's hand-drawn pencil sketch (full-body pose + "PIP THE PENGUIN" name badge lockup). This sketch is the canonical reference for all mascot/logo art — nothing replaces it, art tools only clean it up.

**Mascot art status:**
- v1 attempt — Vectorizer.ai default trace: **rejected.** Kept the paper background, ghosted bleed-through text, and pencil shading as blotchy grey fills instead of clean flat colour.
- v2 — Recraft image-to-image using Laranya's sketch as reference: **approved.** Delivered assets:
  - `docs/muscot.png` — Pip full-body, holding the calendar card, teal wing highlight, classic black/white/orange colouring. Matches Prompt A.
  - `docs/logo.png` — "Pip the Penguin" circular badge lockup, candy-pink ring, navy outline. Matches Prompt B.
  - **Outstanding before these are drop-in app assets:** both currently sit on a solid/gradient background (dark radial behind the mascot, grey behind the badge) rather than transparent. Background needs stripping (Recraft's built-in background remover, or remove.bg) before they go into the web app's UI or as the app icon.
- Design rule: keep Pip's body classic penguin colouring (charcoal/black, white belly, orange beak) — don't recolour him fully into the theme palette. Recognisability over theme purity; Candy Pop shows up in the badge, UI, and accessories around him instead. (v2 assets confirm this held.)

**Prompt A — Mascot (full body), reference image = Laranya's Pip sketch:**
> Flat vector mascot illustration of a cute chibi baby penguin named Pip, closely following the reference sketch's pose and proportions: round soft body, one wing raised in a wave, other wing holding a small calendar/planner card. Keep classic penguin colouring — charcoal/black head and back, white belly, orange triangle beak — with a playful teal highlight on the wing, matching the original drawing. Card held in wing is white with a candy-pink circular marker and yellow grid lines. Thick clean black outline, simple 2-3 tone flat shading, no gradients, transparent background, centered, friendly rounded "Candy Pop" style. Brand accent colours: candy pink #FF6F91, teal #4CD4C6, sunshine yellow #FFD34E.

**Prompt B — Logo badge, reference image = Laranya's "PIP THE PENGUIN" badge sketch:**
> Flat vector logo badge for a kids' travel app called "Magic Trip Planner," based on the reference hand-drawn badge: circular badge shape with "PIP THE PENGUIN" arched around the top in a rounded bubbly hand-lettered font matching the playful loops of the original sketch. Badge background candy pink #FF6F91 or white, text in white or navy #1B2A4A with a thin black outline, small simplified penguin face icon centered inside, matching mascot style. Clean vector, no gradients, no background bleed, transparent background, app-icon ready.

## Design theme: Candy Pop
Kids' vote, chosen over two other directions considered (Sunny Coastal — navy/orange/teal matching Pip's natural colouring; Passport Stamp — cream/navy/red travel-journal feel).

## Design system v1

**Colour tokens**
| Token | Hex | Use |
|---|---|---|
| Primary — Candy Pink | `#FF6F91` | primary actions, brand accents |
| Secondary — Teal | `#4CD4C6` | primary buttons, links |
| Accent — Sunshine Yellow | `#FFD34E` | tags/chips, highlights |
| Text — Navy | `#1B2A4A` | body/heading text (contrast) |
| Background — White | `#FFFFFF` | base surface |

**Type pairing**
- Heading: Baloo 2 / Fredoka (rounded, bubbly)
- Body: Nunito / Quicksand (clean, friendly)

**Components**
- Primary button: teal fill, white text, full pill radius
- Secondary button: white fill, pink outline + text, pill radius
- Tag/chip: yellow fill, dark navy text, pill radius
- Card: white surface, 16px rounded corners, soft shadow

This is a v1 working draft — expect it to tighten once Pip's final art lands (Prompt A/B above).

## Theme v1.1 — Candy Sky + Sticker Party + Candy Header (proposed by Papa, awaiting Chief Designer sign-off)
- Page background is now a soft pink-to-yellow gradient (Candy Sky) instead of flat white; cards/inputs stay white so they float on it.
- Cards, pill buttons, and chips got a 2px navy outline and a small solid offset shadow (Sticker Party) instead of a soft blur shadow.
- Chips tilt slightly left/right, alternating, like they were stuck on by hand.
- A few small twinkling star sparkles sit near the edges of the form, loading, and results screens (off if you have reduced-motion turned on).
- Every screen now has a teal wave header (Candy Header) with the Pip badge and app name. Pip peeks over the wave on loading/results/error screens — not on the home screen, since the big Pip already lives there.
- Open question for the Chief Designer: is the badge-on-the-left header placement the right call, or should it move?

## Funny thinking-messages (Chief of Characters & Fun)
- "When you go to the beach, make sure to wave to the waves."
- "If you feed the seagulls, they'll steal your chips and never leave you alone." *(rewritten from Mehar's original — the original line read like self-harm phrasing even though it was meant as a joke about seagulls stealing food)*

More to be added as the app grows — Chief of Characters & Fun's call, not Claude's or Papa's.
