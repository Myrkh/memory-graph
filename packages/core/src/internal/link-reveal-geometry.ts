/**
 * Pure geometry for the on-screen link reveal (Innovation 04 polish).
 *
 * Given the DOMRects of two annotation `<mark>` elements, produces an SVG
 * path that arcs *over* the text between them — never through it. No DOM
 * access, no React — the primitive `LinkReveal` reads rects and composes
 * results from here.
 */

export interface RevealPath {
  /** SVG `d` attribute — a single Q-command quadratic Bézier. */
  d: string;
}

const MIN_ARC_HEIGHT = 20;
const MAX_ARC_HEIGHT = 64;
const ARC_HEIGHT_RATIO = 1 / 6;

/**
 * Bézier from the top-center of `from` to the top-center of `to`,
 * arcing upward. Viewport coordinates (use `getBoundingClientRect()` —
 * `LinkReveal` renders a `position: fixed` overlay so no scroll offset
 * math needed).
 */
export function computeRevealPath(from: DOMRect, to: DOMRect): RevealPath {
  const fromX = from.left + from.width / 2;
  const fromY = from.top;
  const toX = to.left + to.width / 2;
  const toY = to.top;

  const midX = (fromX + toX) / 2;
  const topY = Math.min(fromY, toY);
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const arcHeight = Math.max(
    MIN_ARC_HEIGHT,
    Math.min(MAX_ARC_HEIGHT, distance * ARC_HEIGHT_RATIO),
  );
  const ctrlY = topY - arcHeight;

  return {
    d: `M ${fromX.toFixed(2)} ${fromY.toFixed(2)} Q ${midX.toFixed(2)} ${ctrlY.toFixed(2)} ${toX.toFixed(2)} ${toY.toFixed(2)}`,
  };
}

/**
 * A rect qualifies for the on-screen reveal when its vertical span is
 * fully inside the viewport, respecting a small safety margin. Horizontal
 * overflow is ignored — paragraphs are narrower than the viewport in
 * virtually every real layout.
 */
export function isRectOnScreen(rect: DOMRect, viewportHeight: number, margin = 8): boolean {
  if (rect.width === 0 && rect.height === 0) return false;
  return rect.top >= margin && rect.bottom <= viewportHeight - margin;
}
