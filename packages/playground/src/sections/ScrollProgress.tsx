/**
 * Scroll progress bar — a 2px coral hairline fixed to the top of the
 * viewport that grows from 0 to 100% as the user scrolls the page.
 *
 * Pure CSS via `animation-timeline: scroll(root)` (supported in Chrome
 * 115+, Safari 18+, Firefox 139+). Older browsers see nothing — the bar
 * is invisible at rest. No JS, no listeners, no re-renders.
 *
 * Signature touch: grows with the same coral accent used throughout,
 * matching the axis hairline aesthetic of the graph itself.
 */
export function ScrollProgress() {
  return <div className="site-scroll-progress" aria-hidden role="presentation" />;
}
