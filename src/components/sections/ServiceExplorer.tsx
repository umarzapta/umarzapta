/**
 * ServiceExplorer — Section 03. Four interactive rows that expand on hover
 * and reveal full detail on click. Keyboard: Tab to a row, Enter to toggle.
 */
import { useState } from 'react';
import { services, type ServiceId } from '@/content/services';
import { copy, whatsappHref } from '@/content/site';
import './explorer.css';

export default function ServiceExplorer() {
  const [open, setOpen] = useState<ServiceId | null>(null);
  const [hovered, setHovered] = useState<ServiceId | null>(null);
  const external = whatsappHref().startsWith('http');

  return (
    <section className="section explorer" id="services" aria-labelledby="explorer-title">
      <div className="container-x">
        <div className="section-head" data-reveal>
          <p className="meta section-eyebrow">03 / Services</p>
          <h2 className="section-title" id="explorer-title">
            {copy.explorer.headline}
          </h2>
        </div>

        <ul className="explorer-list" data-reveal>
          {services.map((s) => {
            const isOpen = open === s.id;
            const isHover = hovered === s.id;
            return (
              <li
                key={s.id}
                className="explorer-item"
                data-open={isOpen || undefined}
                data-hover={isHover || undefined}
                onPointerEnter={() => setHovered(s.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  className="explorer-row"
                  aria-expanded={isOpen}
                  aria-controls={`explorer-detail-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  onFocus={() => setHovered(s.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="meta explorer-index">{s.index}</span>
                  <span className="explorer-main">
                    <span className="explorer-title">
                      <span className="explorer-category">{s.category}</span>
                      <span className="explorer-name">{s.name}</span>
                    </span>
                    <span className="explorer-desc" data-open={(isHover || isOpen) || undefined}>
                      <span className="explorer-desc-inner">{s.hook}</span>
                    </span>
                  </span>
                  <span className="explorer-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <span className="explorer-line" aria-hidden="true" />

                <div className="explorer-detail" id={`explorer-detail-${s.id}`} data-open={isOpen || undefined}>
                  <div className="explorer-detail-inner">
                    <div className="explorer-detail-grid">
                      <div>
                        <p className="explorer-headline">{s.headline}</p>
                        <p className="explorer-lead">{s.lead}</p>
                      </div>
                      <ul className="explorer-caps">
                        {s.capabilities.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="explorer-ctas">
                      <a
                        className="btn btn-accent"
                        href={whatsappHref(s.whatsappMessage)}
                        target={external ? '_blank' : undefined}
                        rel="noopener"
                      >
                        {s.cta}
                      </a>
                      <a className="btn btn-ghost" href="#navigator">
                        Open in navigator
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
