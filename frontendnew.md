VENTURESCOPE

VERSION: 2.0
STATUS: Ready for Implementation
SCOPE: Complete visual + structural overhaul (frontend/src/)
PALETTE: Warm Parchment × Aged Bronze × Dark Cognac

Vision
VentureScope should feel like a high-end private intelligence briefing — the kind of
document a seasoned venture analyst pulls from a leather folio at a partner meeting.
Think aged parchment meets precision instrumentation: warm creams and toffee
browns for the base, deep cognac darks for depth, and sharp bronze-gold accents for
data that matters.
The redesign goal is to make it a premium, publishable product that could be showcased in
a portfolio or shown to investors without embarrassment — and that feels genuinely
different from the sea of dark-blue-and-neon dashboards flooding the market right now.

Design System

Color Palette

TOKEN HEX USAGE
--ink #1a1008 Base background — near-black with warm brown undertone
--panel #221608 Card/panel backgrounds — dark espresso

TOKEN HEX USAGE
--surface #2e1e0f Elevated surfaces, modals, hover states
--amber #c8923a Primary accent — aged bronze/amber
--cream #f0e6d0 Primary text — warm off-white parchment
--parchment #d9c9a8 Secondary text, labels — aged paper tone
--danger #c0442a Errors, offline states — burnt sienna red
--success #5c9e6e Online/live states — muted sage green

Typography
Display: Playfair Display — Refined serif for editorial gravitas.
Body: DM Sans — Warm geometric sans-serif for modern UI.
Data: JetBrains Mono — For logs, scores, and precision readouts.

Motion & Layout
Card Entrances: Staggered 400ms fade/slide transitions.
Status: Subtle amber pulse (2s loop) for live data.
Sidebar: Fixed 280px left-column architecture.
Responsive: Full breakpoint support from mobile (768px) to desktop (1100px+).

Page Architecture

┌────────────────────────────────────────────────────────────┐
│ NAVBAR: VentureScope [Pipeline Health] [Agent Mode] │
├───────────┬────────────────────────────────────────────────┤
│ SIDEBAR │ [Gap Radar] [Copilot] [Intel] [Digest] [HB] │
│ ├────────────────────────────────────────────────┤
│ ● Agent │ │
│ Status │ ACTIVE TAB CONTENT PANEL │
•
•
•

•
•
•
•

│ │ (Grid of Intelligence Cards) │
│ --------- │ │
│ SOUL Context │
└───────────┴────────────────────────────────────────────────┘