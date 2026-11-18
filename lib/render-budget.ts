// Pixel budget, not user-agent sniffing: identical geometry/choreography on every tier.
export function renderBudget(width: number, height: number, deviceDpr: number) {
  const area = Math.max(1, width * height);
  const dpr = Math.min(Math.max(1, deviceDpr), 1.5, Math.sqrt(2_600_000 / area));
  return { dpr: Math.max(.75, dpr), transmissionScale: width < 760 ? .5 : .65 };
}

export function visibleStageDistance(z: number, aspect: number, fov: number) {
  // Include the furthest geometry (5 units behind origin) and each stage's width.
  return (z + 5) * Math.tan(fov * Math.PI / 360) * aspect + 9;
}
