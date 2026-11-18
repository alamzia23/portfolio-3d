// Shared mutable values keep scroll and pointer updates off React's render path.
export const motion = { chapter: 0, local: 0, progress: 0, project: 0, process: 0, pointerX: 0, pointerY: 0, reduced: false };

// Wake the demand renderer without scheduling React updates on scroll/pointer events.
const listeners = new Set<() => void>();
export function requestSceneFrame() { listeners.forEach(listener => listener()); }
export function subscribeSceneFrames(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
