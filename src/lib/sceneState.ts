import type { Point } from './geometry';

/**
 * Mutable state shared between the DOM navigator and the 3D scene.
 * Written by React event handlers, read every frame by the render loop.
 * Kept out of React state so pointer movement never triggers re-renders.
 */
export interface SceneState {
  /** Normalised pointer, -1..1, +y down. Zero when idle. */
  pointer: Point;
  /** Unit direction of the hovered / focused node, or null. */
  focusDir: Point | null;
  /** Unit direction of the selected node, or null. */
  selectDir: Point | null;
  reducedMotion: boolean;
  mobile: boolean;
  /** Whether the hero is on screen; the render loop pauses when false. */
  visible: boolean;
}

export function createSceneState(): SceneState {
  return {
    pointer: { x: 0, y: 0 },
    focusDir: null,
    selectDir: null,
    reducedMotion: false,
    mobile: false,
    visible: true,
  };
}
