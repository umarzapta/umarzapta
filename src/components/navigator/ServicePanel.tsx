/**
 * ServicePanel — the service detail state of the Cosmic Navigator.
 * `variant="column"` replaces the hero copy on desktop.
 * `variant="inline"` expands under the selected node on mobile.
 */
import { useEffect, useRef } from 'react';
import { services, type Service, type ServiceId } from '@/content/services';
import { whatsappHref } from '@/content/site';

interface Props {
  service: Service;
  variant: 'column' | 'inline';
  onBack: () => void;
  onSwitch: (id: ServiceId) => void;
}

export default function ServicePanel({ service, variant, onBack, onSwitch }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading so keyboard and screen-reader users land on the content.
  useEffect(() => {
    heading.current?.focus({ preventScroll: variant === 'column' });
  }, [service.id, variant]);

  const external = whatsappHref().startsWith('http');

  return (
    <section
      className="service-panel"
      data-variant={variant}
      aria-labelledby={`panel-title-${variant}`}
      key={service.id}
    >
      <button type="button" className="panel-back" onClick={onBack}>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="meta">Back to navigator</span>
      </button>

      <p className="meta panel-meta">
        {service.index} / {service.category}
      </p>
      <h2 className="panel-title" id={`panel-title-${variant}`} ref={heading} tabIndex={-1}>
        {service.name}
      </h2>
      <p className="panel-headline">{service.headline}</p>

      <p className="panel-lead">{service.lead}</p>
      <ul className="panel-capabilities">
        {service.capabilities.map((c, i) => (
          <li key={c}>
            <span className="meta panel-cap-index">{String(i + 1).padStart(2, '0')}</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <div className="panel-ctas">
        <a
          className="btn btn-accent"
          href={whatsappHref(service.whatsappMessage)}
          target={external ? '_blank' : undefined}
          rel="noopener"
        >
          {service.cta}
        </a>
        <a className="btn btn-ghost" href={whatsappHref()} target={external ? '_blank' : undefined} rel="noopener">
          WhatsApp Cosmic
        </a>
      </div>

      {variant === 'column' && (
        <nav className="panel-switch" aria-label="Other directions">
          {services
            .filter((s) => s.id !== service.id)
            .map((s) => (
              <button key={s.id} type="button" className="panel-switch-item" onClick={() => onSwitch(s.id)}>
                <span className="meta">
                  {s.index} / {s.category}
                </span>
                <span className="panel-switch-name">{s.name}</span>
              </button>
            ))}
        </nav>
      )}
    </section>
  );
}
