import { copy } from '@/content/site';
import { whatsappHref } from '@/content/site';

interface Props {
  /** True while a service is selected on desktop (panel replaces the copy). */
  hidden: boolean;
}

export default function HeroCopy({ hidden }: Props) {
  return (
    <div className="hero-copy-block" data-hidden={hidden || undefined} aria-hidden={hidden || undefined} inert={hidden || undefined}>
      <p className="meta hero-eyebrow">
        <span className="hero-eyebrow-dot" aria-hidden="true" />
        {copy.hero.eyebrow}
      </p>
      <h1 className="hero-headline">
        {copy.hero.headline.map((line, i) => (
          <span key={i} className="hero-line">
            {line}
          </span>
        ))}
      </h1>
      <p className="hero-support">{copy.hero.support}</p>
      <div className="hero-ctas">
        <a className="btn btn-primary" href={whatsappHref()} target={whatsappHref().startsWith('http') ? '_blank' : undefined} rel="noopener">
          {copy.hero.primary}
        </a>
        <a className="btn btn-ghost" href="#services">
          {copy.hero.secondary}
        </a>
      </div>
    </div>
  );
}
