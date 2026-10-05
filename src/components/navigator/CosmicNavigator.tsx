/**
 * CosmicNavigator — the hero experience.
 *
 * Owns the interaction state (hover / selection), the pointer parallax loop,
 * the selection camera move, the scroll hand-off and the WebGL fallback.
 * The 3D scene is lazy-loaded so the hero paints before three.js arrives.
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { camera as cam, core, motion, node as nodeTokens, orbit, parallax } from '@/config/tokens';
import { services, serviceById, type ServiceId } from '@/content/services';
import { nodeDirection } from '@/lib/geometry';
import { supportsWebGL, useFinePointer, useIsDesktop, useReducedMotion } from '@/lib/media';
import { createSceneState } from '@/lib/sceneState';
import HeroCopy from './HeroCopy';
import OrbitalSystem from './OrbitalSystem';
import ServiceNode, { type NodeVisualState } from './ServiceNode';
import ServicePanel from './ServicePanel';
import './navigator.css';

const CosmicScene = lazy(() => import('./CosmicScene'));

const DEG = Math.PI / 180;
/** Core radius projected into the 1000-unit SVG space (plus a small margin). */
const CORE_RADIUS_SVG = (core.radius / (cam.distance * Math.tan((cam.fov / 2) * DEG))) * 500 * 1.1;

function visualState(id: ServiceId, hovered: ServiceId | null, selected: ServiceId | null): NodeVisualState {
  if (selected) return selected === id ? 'selected' : 'dim';
  if (hovered) return hovered === id ? 'hover' : 'quiet';
  return 'default';
}

export default function CosmicNavigator() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageOuterRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Partial<Record<ServiceId, HTMLButtonElement | null>>>({});
  const scene = useRef(createSceneState()).current;

  const [hovered, setHovered] = useState<ServiceId | null>(null);
  const [selected, setSelected] = useState<ServiceId | null>(null);
  const [webgl, setWebgl] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [visible, setVisible] = useState(true);

  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const finePointer = useFinePointer();

  // Keep the shared scene state in sync with React state.
  scene.reducedMotion = reduced;
  scene.mobile = !desktop;
  scene.focusDir = hovered ? nodeDirection(hovered) : null;
  scene.selectDir = selected ? nodeDirection(selected) : null;

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  // Pause the render loop and parallax when the hero is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pointer parallax: smoothed CSS variables on the stage, raw target to the scene.
  useEffect(() => {
    const el = sectionRef.current;
    const stage = stageRef.current;
    if (!el || !stage || !desktop || !finePointer || reduced || !visible) {
      scene.pointer.x = 0;
      scene.pointer.y = 0;
      stage?.style.setProperty('--px', '0');
      stage?.style.setProperty('--py', '0');
      return;
    }
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    const tick = () => {
      current.x += (target.x - current.x) * parallax.lerp;
      current.y += (target.y - current.y) * parallax.lerp;
      scene.pointer.x = current.x;
      scene.pointer.y = current.y;
      stage.style.setProperty('--px', current.x.toFixed(4));
      stage.style.setProperty('--py', current.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [desktop, finePointer, reduced, visible, scene]);

  // Selection camera move: shift the whole stage toward the chosen node.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const size = stage.clientWidth;
    let x = 0;
    let y = 0;
    let scale = 1;
    if (selected && desktop) {
      const d = nodeDirection(selected);
      x = -d.x * orbit.rx * size * 0.42;
      y = -d.y * orbit.ry * size * 0.42;
      scale = nodeTokens.selectedScale;
    }
    gsap.to(stage, {
      x,
      y,
      scale,
      duration: reduced ? 0 : motion.major,
      ease: motion.easeInOut,
      overwrite: 'auto',
    });
  }, [selected, desktop, reduced]);

  // Scroll hand-off: the 3D environment recedes as the page moves on.
  useEffect(() => {
    const section = sectionRef.current;
    const outer = stageOuterRef.current;
    const copyEl = copyRef.current;
    if (!section || !outer || !copyEl || !desktop || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(outer, {
        opacity: 0.2,
        y: -60,
        scale: 0.95,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom 20%', scrub: 0.6 },
      });
      gsap.to(copyEl, {
        opacity: 0.1,
        y: -30,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '85% top', scrub: 0.6 },
      });
    });
    return () => ctx.revert();
  }, [desktop, reduced]);

  // Escape returns to the navigator.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const select = useCallback((id: ServiceId) => {
    setSelected((prev) => (prev === id ? null : id));
    setHovered(null);
  }, []);

  const back = useCallback(() => {
    const id = selected;
    setSelected(null);
    setHovered(null);
    if (id) requestAnimationFrame(() => nodeRefs.current[id]?.focus({ preventScroll: true }));
  }, [selected]);

  const selectedService = selected ? serviceById[selected] : null;
  const onScene = (ready: boolean) => () => setSceneReady(ready);

  const stageVars = useMemo(
    () =>
      ({
        '--plx-bg': `${parallax.background}px`,
        '--plx-core': `${parallax.core}px`,
        '--plx-orbits': `${parallax.orbits}px`,
        '--plx-nodes': `${parallax.nodes}px`,
        '--node-w': `${nodeTokens.cardWidth}px`,
        '--node-gap': `${nodeTokens.gap}px`,
        '--node-dot': `${nodeTokens.markerSize}px`,
        '--node-hover-scale': String(nodeTokens.hoverScale),
        '--node-quiet': String(nodeTokens.quietOpacity),
        '--node-dim': String(nodeTokens.dimOpacity),
      }) as React.CSSProperties,
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="navigator"
      className="hero"
      data-selected={selected ?? undefined}
      data-hovered={hovered ?? undefined}
      aria-label="Cosmic Navigator"
    >
      <div className="hero-inner container-x">
        <div className="hero-copy" ref={copyRef}>
          <HeroCopy hidden={Boolean(selected) && desktop} />
          {desktop && selectedService && (
            <ServicePanel service={selectedService} variant="column" onBack={back} onSwitch={select} />
          )}
        </div>

        <div className="hero-stage" ref={stageOuterRef}>
          <div className="nav-box">
            <div className="nav-stage" ref={stageRef} style={stageVars}>
              <div className="layer layer-bg" aria-hidden="true">
                <div className="atmosphere" />
              </div>
              <div className="layer layer-core" aria-hidden="true">
                <div className="core-fallback" data-hidden={sceneReady || undefined}>
                  <span className="core-fallback-ring" />
                  <span className="core-fallback-body" />
                </div>
                {webgl && (
                  <div className="scene" data-ready={sceneReady || undefined}>
                    <Suspense fallback={null}>
                      <CosmicScene state={scene} visible={visible} onReady={onScene(true)} />
                    </Suspense>
                  </div>
                )}
              </div>
              <div className="layer layer-orbits">
                <OrbitalSystem hovered={hovered} selected={selected} reducedMotion={reduced} coreRadius={CORE_RADIUS_SVG} />
              </div>
              <div className="layer layer-nodes">
                {services.map((s) => (
                  <ServiceNode
                    key={s.id}
                    ref={(el) => {
                      nodeRefs.current[s.id] = el;
                    }}
                    service={s}
                    layout="orbit"
                    state={visualState(s.id, hovered, selected)}
                    onHover={setHovered}
                    onSelect={select}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="meta nav-hint" aria-hidden="true">
            <span>01 – 04</span>
            <span className="nav-hint-rule" />
            <span>{selected ? 'Esc · Back to navigator' : 'Select a direction'}</span>
          </p>
        </div>

        {/* Mobile: vertical navigation with inline detail. */}
        <ol className="nav-list" aria-label="Business directions">
          {services.map((s) => (
            <li key={s.id} className="nav-list-item">
              <ServiceNode
                service={s}
                layout="list"
                state={visualState(s.id, hovered, selected)}
                onHover={setHovered}
                onSelect={select}
              />
              {!desktop && selected === s.id && (
                <ServicePanel service={s} variant="inline" onBack={back} onSwitch={select} />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
