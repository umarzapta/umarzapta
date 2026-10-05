/**
 * SCENE + MOTION TOKENS
 * ----------------------------------------------------------------
 * Every tunable visual parameter for the Cosmic Navigator lives here.
 * Colour / type / spacing tokens live in src/styles/global.css.
 *
 * Art-direction examples:
 *   "Reduce the glow by 40%"        -> glow.core *= 0.6
 *   "Make the camera slower"        -> camera.lerp  (lower = slower)
 *   "Increase spacing between nodes"-> orbit.rx / orbit.ry
 *   "Make the environment quieter"  -> particles.*, core.rotationSpeed
 */

export const orbit = {
  /** Ellipse radii as a fraction of the navigator box (0..0.5). */
  rx: 0.4,
  ry: 0.32,
  /** Secondary depth ring (3D), relative to core radius. */
  ring3d: { radius: 1.55, tilt: 0.42, thickness: 0.004, opacity: 0.35 },
  /** Node placement angle in degrees. 0 = right, -90 = top. */
  angles: { order: -125, comply: -55, grow: 55, fund: 125 } as const,
  /** How much the orbit marker dots travel per second (fraction of ellipse). */
  markerSpeed: 0.012,
};

export const node = {
  cardWidth: 208, // px
  gap: 14, // px between ring point and card
  markerSize: 8, // px
  hoverScale: 1.035,
  selectedScale: 1.06,
  quietOpacity: 0.55, // other nodes while one is hovered
  dimOpacity: 0.28, // other nodes while one is selected
};

export const camera = {
  fov: 34,
  distance: 6.2,
  /** Pointer parallax: max world-unit offset of the camera. */
  parallax: 0.14,
  /** Camera shift toward the selected node (world units). */
  selectShift: { x: 0.85, y: 0.55 },
  /** Dolly in on selection (distance multiplier). */
  selectDolly: 0.88,
  /** Interpolation factor per frame (0.02 slow ... 0.15 snappy). */
  lerp: 0.055,
};

/** DOM parallax, in max px per layer (desktop only, pointer driven). */
export const parallax = {
  background: 6,
  orbits: 10,
  nodes: 16,
  core: 8,
  lerp: 0.06,
};

export const core = {
  /** World units. Screen size depends on camera.distance / fov. */
  radius: 0.62,
  /** Radians per second. */
  rotationSpeed: 0.045,
  /** Breathing amplitude (scale). */
  breathe: 0.012,
  /** Tilt toward hovered / selected node (radians). */
  tiltHover: 0.1,
  tiltSelect: 0.22,
  /** Fresnel rim intensity. */
  rimBase: 0.55,
  rimActive: 0.9,
};

export const glow = {
  /** Core halo opacity (0..1). */
  core: 0.5,
  coreActive: 0.68,
  /** Accent node halo opacity. */
  node: 0.45,
};

export const particles = {
  desktop: 140,
  mobile: 36,
  spread: 7,
  size: 0.022,
  opacity: 0.4,
  drift: 0.015, // world units / s
};

export const motion = {
  /** Seconds. Mirrors --duration-* in global.css. */
  micro: 0.2,
  hover: 0.28,
  panel: 0.48,
  major: 0.9,
  section: 0.7,
  /** GSAP ease names. */
  ease: 'power3.out',
  easeInOut: 'power2.inOut',
  easeExpo: 'expo.out',
};

export const breakpoints = {
  /** Below this width the mobile interaction model is used. */
  desktop: 1024,
};
