/**
 * OrbitalSystem — the 2D orbital layer (SVG) that connects the core to the
 * four destinations. Shares its geometry with ServiceNode via lib/geometry so
 * DOM nodes and paths always line up.
 */
import { orbit } from '@/config/tokens';
import { services, type ServiceId } from '@/content/services';
import { nodePointSvg, orbitPath, trajectoryPath } from '@/lib/geometry';

interface Props {
  hovered: ServiceId | null;
  selected: ServiceId | null;
  reducedMotion: boolean;
  /** Core radius in SVG units (1000 viewBox). */
  coreRadius: number;
}

export default function OrbitalSystem({ hovered, selected, reducedMotion, coreRadius }: Props) {
  const rx = orbit.rx * 1000;
  const ry = orbit.ry * 1000;
  const path = orbitPath();
  const markerDur = `${Math.round(1 / orbit.markerSpeed)}s`;

  return (
    <svg
      className="orbits"
      viewBox="0 0 1000 1000"
      aria-hidden="true"
      data-state={selected ? 'selected' : hovered ? 'hover' : 'idle'}
    >
      <defs>
        <path id="orbit-path" d={path} />
      </defs>

      {/* Primary orbit through the four nodes. */}
      <ellipse className="orbit orbit-primary" cx="500" cy="500" rx={rx} ry={ry} />
      {/* Secondary orbit for depth (rotated, quieter). */}
      <ellipse
        className="orbit orbit-secondary"
        cx="500"
        cy="500"
        rx={rx * 1.04}
        ry={ry * 0.56}
        transform="rotate(-14 500 500)"
      />

      {/* Trajectories: core -> node. */}
      {services.map((s) => {
        const active = selected === s.id || (!selected && hovered === s.id);
        return (
          <path
            key={s.id}
            className="trajectory"
            d={trajectoryPath(s.id, coreRadius)}
            data-active={active || undefined}
            data-selected={selected === s.id || undefined}
          />
        );
      })}

      {/* Tick marks where trajectories meet the orbit. */}
      {services.map((s) => {
        const p = nodePointSvg(s.id);
        return <circle key={s.id} className="orbit-tick" cx={p.x} cy={p.y} r="14" />;
      })}

      {/* Travelling markers (disabled under reduced motion). */}
      {!reducedMotion &&
        [0, 0.37, 0.71].map((offset, i) => (
          <circle key={i} className="orbit-marker" r="3.5">
            <animateMotion dur={markerDur} repeatCount="indefinite" begin={`-${offset * (1 / orbit.markerSpeed)}s`}>
              <mpath href="#orbit-path" />
            </animateMotion>
          </circle>
        ))}
    </svg>
  );
}
