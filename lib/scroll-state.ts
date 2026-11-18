export type ChapterBounds = { top: number; height: number };

export function sampleScroll(scrollY: number, bounds: readonly ChapterBounds[], reduced = false) {
  const y = Math.max(0, Number.isFinite(scrollY) ? scrollY : 0);
  let chapter = 0;
  bounds.forEach((section, index) => { if (y >= section.top) chapter = index; });
  const section = bounds[chapter];
  const local = section ? Math.max(0, Math.min(1, (y - section.top) / Math.max(1, section.height))) : 0;
  const last = Math.max(0, bounds.length - 1);
  // Reading time is retained. A separate dolly gives immediate movement during it.
  const transition = chapter === last ? 0 : Math.max(0, (local - .58) / .42);
  return {
    chapter, local,
    progress: reduced ? chapter : Math.min(last, chapter + transition),
    process: Math.min(4, Math.floor(local / .72 * 5)),
  };
}

export function chapterDolly(local: number, reduced: boolean) {
  // Non-zero slope at the first scroll pixel, returns to zero at chapter joins.
  return reduced ? 0 : 1.4 * Math.sin(Math.PI * Math.max(0, Math.min(1, local)));
}

export function heroTextOffset(scrollY: number, reduced: boolean) {
  return reduced || scrollY <= 0 ? 0 : -Math.min(64, scrollY * .16);
}

export function animationDelta(delta: number) {
  // Idle time isn't animation time. Real 30/60/120Hz frame deltas are preserved.
  return !Number.isFinite(delta) || delta <= 0 || delta > .15 ? 1 / 60 : Math.min(delta, .05);
}
