🏁 Phase 1: Design Tokens & Global Foundation
[x] Initialize Typography: Import Playfair Display, DM Sans, and JetBrains Mono via Google Fonts or @fontsource.

[x] Configure Theme Variables: Create a theme.css or Tailwind config with the specified hex codes (e.g., --ink: #1a1008, --amber: #c8923a).

[x] Define Animation Keyframes:

[x] Implement entrance (translateY + opacity).

[x] Implement pulse-amber for status indicators.

[x] Implement shimmer for "Coming Soon" states.

[x] Setup Global Reset: Apply --ink background and --cream default text color to the root body.

🏛️ Phase 2: Layout & Navigation Architecture
[x] Main Layout Wrapper: Build the two-column CSS Grid (280px sidebar | 1fr content).

[x] Top Navbar:

[x] Fixed 56px height.

[x] Left: Logo (Playfair Display) + Mobile Hamburger.

[x] Right: Pipeline Health Chip + Agent Mode Badge.

[x] The Sidebar:

[x] Top: Agent Status (Live pulse indicator).

[x] Middle: SOUL Context Editor (Tag chip interface).

[x] Bottom: System Stats (3-tile grid using JetBrains Mono).

[x] Sticky Tab Nav: Create the 5-tab navigation bar with horizontal scrolling for mobile.

🧩 Phase 3: Component Library (The UI Kit)
[x] The "Dossier" Card:

[x] Background: --panel.

[x] Border: 1px solid --border.

[x] Hover: Scale(1.015) + --border-strong.

[x] Typography Utility Classes: Create presets for "Hero Stats" (52px) and "Micro Labels" (11px).

[x] Status Indicators: Build the "Muted Sage" (Success) and "Deep Terracotta" (Warning) score dots.

[x] Animated Data Components:

[x] Number Counter (RequestAnimationFrame hook).

[x] D3-based Radar Path (Stroke-dashoffset animation).

📑 Phase 4: Feature Implementations (Tabs)
[x] Gap Radar View: Implement the D3 Radar chart with the "draw-on-load" motion.

[x] Copilot & Intel Tabs: Layout the main grid using repeat(auto-fill, minmax(340px, 1fr)).

[x] Staggered Entrance Logic: Wrap card lists in a component that applies the 60ms staggered delay.

[x] "Locked" Tab State:

[x] Create the "Digest" and "HB" tab overlays.

[x] Apply the diagonal shimmer animation to these panels.

📱 Phase 5: Responsive Refinement
[x] Tablet Breakpoint (1100px): Shrink sidebar to 240px and collapse grid to single column.

[x] Mobile Breakpoint (768px):

[x] Implement the translateX(-100%) sidebar drawer.

[x] Verify horizontal scroll on Tab Nav.

[ ] Interactive Polish: Add toast notifications with the translateY(-20px) entry.

🎨 Visual Check-off (Implementation Quality)
Does it pass the "VentureScope" test?

[x] No pure blacks or pure whites (everything is warm/creamy).

[x] Serif fonts are used only for headings/branding.

[x] Data feels like a "precision instrument" (Monospace fonts).

[x] Transitions feel smooth and "heavy" (Cubic-bezier curves).