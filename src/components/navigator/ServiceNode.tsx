/**
 * ServiceNode — one selectable destination.
 * `layout="orbit"` positions the node on the ellipse (desktop).
 * `layout="list"` renders it as a full-width row (mobile).
 */
import { forwardRef } from 'react';
import type { Service } from '@/content/services';
import { isUpperNode, nodePointPct } from '@/lib/geometry';

export type NodeVisualState = 'default' | 'hover' | 'quiet' | 'selected' | 'dim';

interface Props {
  service: Service;
  layout: 'orbit' | 'list';
  state: NodeVisualState;
  onHover: (id: Service['id'] | null) => void;
  onSelect: (id: Service['id']) => void;
}

const ServiceNode = forwardRef<HTMLButtonElement, Props>(function ServiceNode(
  { service, layout, state, onHover, onSelect },
  ref,
) {
  const isOrbit = layout === 'orbit';
  const p = nodePointPct(service.id);
  const upper = isUpperNode(service.id);
  const expanded = state === 'hover' || state === 'selected';

  return (
    <div
      className="node"
      data-layout={layout}
      data-state={state}
      data-side={upper ? 'upper' : 'lower'}
      style={isOrbit ? { left: `${p.x}%`, top: `${p.y}%` } : undefined}
    >
      {isOrbit && <span className="node-dot" aria-hidden="true" />}
      <button
        ref={ref}
        type="button"
        className="node-card"
        aria-pressed={state === 'selected'}
        aria-describedby={`node-more-${layout}-${service.id}`}
        onPointerEnter={() => onHover(service.id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(service.id)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(service.id)}
      >
        <span className="node-head">
          <span className="meta node-meta">
            {service.index} / {service.category}
          </span>
          <span className="node-arrow" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
        <span className="node-name">{service.name}</span>
        <span className="node-more" id={`node-more-${layout}-${service.id}`} data-open={expanded || undefined}>
          <span className="node-more-inner">
            <span className="node-hook">{service.hook}</span>
            <span className="node-explore meta">Explore</span>
          </span>
        </span>
      </button>
    </div>
  );
});

export default ServiceNode;
