import { orbit } from '@/config/tokens';
import type { ServiceId } from '@/content/services';

export interface Point {
  x: number;
  y: number;
}

const DEG = Math.PI / 180;

/** Unit direction for a node angle (screen space: +y is down). */
export function nodeDirection(id: ServiceId): Point {
  const a = orbit.angles[id] * DEG;
  return { x: Math.cos(a), y: Math.sin(a) };
}

/** Node position on the orbit ellipse as a percentage of the navigator box. */
export function nodePointPct(id: ServiceId): Point {
  const d = nodeDirection(id);
  return { x: 50 + d.x * orbit.rx * 100, y: 50 + d.y * orbit.ry * 100 };
}

/** Node position in a 1000x1000 SVG viewBox. */
export function nodePointSvg(id: ServiceId): Point {
  const p = nodePointPct(id);
  return { x: p.x * 10, y: p.y * 10 };
}

/** Whether a node sits in the upper half (cards open upward). */
export function isUpperNode(id: ServiceId): boolean {
  return orbit.angles[id] < 0;
}

/**
 * Trajectory from the core edge to a node, as an SVG path (1000 viewBox).
 * A quadratic curve with a perpendicular control offset gives a gentle arc.
 */
export function trajectoryPath(id: ServiceId, coreRadius: number, bend = 0.16): string {
  const d = nodeDirection(id);
  const to = nodePointSvg(id);
  const from = { x: 500 + d.x * coreRadius, y: 500 + d.y * coreRadius };
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  // Perpendicular (rotate direction by 90deg), bend direction alternates by side.
  const side = d.x < 0 ? 1 : -1;
  const ctrl = { x: mid.x + -d.y * len * bend * side, y: mid.y + d.x * len * bend * side };
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

/** Full ellipse path for SMIL motion along the orbit. */
export function orbitPath(): string {
  const rx = orbit.rx * 1000;
  const ry = orbit.ry * 1000;
  return `M ${500 - rx} 500 a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
}
