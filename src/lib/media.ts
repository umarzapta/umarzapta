import { useEffect, useState } from 'react';
import { breakpoints } from '@/config/tokens';

function useMedia(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMedia(`(min-width: ${breakpoints.desktop}px)`);
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');

/** Feature-detect WebGL without creating a persistent context. */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
