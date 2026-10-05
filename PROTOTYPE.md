# Cosmic Navigator — Cosmic Division Pte. Ltd.

High-fidelity interactive website prototype. Instead of a brochure, the site opens with a question — *Where does your business need to go?* — and lets the visitor explore four directions around an abstract core: **Order** (Accounting), **Comply** (Corporate Secretary), **Grow** (Singapore Grants) and **Fund** (SME Business Loans).

## Run it

```bash
npm install        # once
npm run dev        # http://localhost:4321
```

Stop the dev server with `Ctrl+C` in that terminal (or `npx astro dev stop` if it was started detached).

Production:

```bash
npm run build      # type-checks (astro check) then builds to dist/
npm run preview    # serves dist/ locally
```

Contact details are read from environment variables so nothing is invented. Copy `.env.example` to `.env` and set `PUBLIC_WHATSAPP_NUMBER` (digits only). Until it is set, WhatsApp CTAs route to the contact section and the footer shows a configuration note.

## Stack

Astro 7 · React 19 islands · Three.js + React Three Fiber · GSAP + ScrollTrigger · Tailwind CSS 4 · Inter Variable.

The 3D runtime is lazy-loaded in its own chunk, so the hero paints (with a CSS core) before three.js arrives. The render loop pauses when the hero leaves the viewport. If WebGL is unavailable, the CSS/SVG orbital system stays as the permanent fallback.

## Where things live

```
src/
  config/tokens.ts            scene + motion parameters (orbit radii, node size, camera, parallax, glow, particles, durations)
  styles/global.css           colour / type / spacing / easing tokens (Tailwind @theme) and button utilities
  styles/sections.css         header, sections 02–06, footer
  content/services.ts         all service copy, audiences, reasons
  content/site.ts             brand, nav, contact config, section copy
  lib/geometry.ts             node placement + trajectory maths shared by DOM and SVG
  lib/sceneState.ts           mutable state shared between React and the render loop
  lib/media.ts                reduced-motion / breakpoint / WebGL detection
  components/
    Header.astro, Footer.astro
    navigator/
      CosmicNavigator.tsx     hero island: state, parallax, selection move, scroll hand-off
      CosmicScene.tsx         R3F scene: core, glass shell, halo, depth rings, particles, camera rig
      OrbitalSystem.tsx       SVG orbit, trajectories, travelling markers
      ServiceNode.tsx         one destination (orbit layout on desktop, list layout on mobile)
      ServicePanel.tsx        service detail state (column on desktop, inline on mobile)
      HeroCopy.tsx            headline + CTAs
      navigator.css
    sections/
      BusinessJourney.astro   02 — stages connected by a scroll-drawn trajectory
      ServiceExplorer.tsx     03 — hover-expand rows, click for detail
      Audiences.astro         04 — who we work with
      WhyCosmic.astro         05 — practical reasons
      FinalCTA.astro          06 — closing CTA with an orbital echo
  pages/index.astro
```

## Art-directing

Everything tunable is in two files:

| Request | Where |
| --- | --- |
| "Reduce the glow by 40%" | `tokens.ts` → `glow.core`, `glow.coreActive`; `global.css` → `--glow-accent` |
| "Make the camera slower" | `tokens.ts` → `camera.lerp` (lower = slower), `motion.major` |
| "Increase spacing between nodes" | `tokens.ts` → `orbit.rx`, `orbit.ry`, `orbit.angles` |
| "Make the environment quieter" | `tokens.ts` → `particles.*`, `core.rotationSpeed`, `orbit.ring3d.opacity` |
| "Less parallax" | `tokens.ts` → `parallax.*`, `camera.parallax` |
| "Make typography more editorial" | `global.css` → `--text-display*`, `--text-h2*`, `--text-meta*` |
| Accent colour | `global.css` → `--color-accent*` (also `ACCENT` in `CosmicScene.tsx`) |

## Interaction model

- **Desktop**: hover/focus a node → it brightens, expands its hook, its trajectory lights up, the core tilts toward it, the others quieten. Click/Enter → the stage shifts toward that destination, the core takes on the accent, and the service panel replaces the hero copy. `Esc` or *Back to navigator* returns focus to the node.
- **Mobile**: a compact core with the orbital system, then a vertical 01→04 list. Tapping a direction expands the service detail inline. No pointer parallax, fewer particles, no camera dolly.
- **Reduced motion**: no parallax, no camera move, no particle drift, no travelling markers, no scroll-driven animation; opacity transitions only.
- **Keyboard**: every node and row is a real `<button>`; focus states are visible; the panel heading receives focus on open.
