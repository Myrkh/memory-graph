import type { MouseEvent } from 'react';

/**
 * Canonical page order. Drives the directional slide on route change —
 * moving to a higher index slides the new page in from the right (forward);
 * moving to a lower index slides it in from the left (backward).
 */
export const PAGE_ORDER = ['home', 'demo', 'docs', 'philosophy'] as const;
export type Page = (typeof PAGE_ORDER)[number];

export function isPage(hash: string): hash is Page {
  return (PAGE_ORDER as readonly string[]).includes(hash);
}

/**
 * Navigate to a site page with a directional view transition. Works as a
 * progressive enhancement: browsers that support the View Transitions API
 * (Chrome 111+, Safari 18.2+, Firefox 139+) get a horizontal slide whose
 * direction matches the page order; older browsers just set the hash.
 *
 * The transition is driven by setting `html[data-site-transition="forward|backward"]`
 * *before* calling `startViewTransition`, then clearing it once the
 * transition finishes. CSS in `site-motion.css` reads that attribute to
 * pick which slide keyframe to run on `::view-transition-old/new(root)`.
 */
export function navigate(target: Page): void {
  if (typeof window === 'undefined') return;
  const currentRaw = window.location.hash.slice(1);
  const currentIdx = (PAGE_ORDER as readonly string[]).indexOf(currentRaw);
  const targetIdx = (PAGE_ORDER as readonly string[]).indexOf(target);
  if (targetIdx === -1) return;

  if (currentRaw === target) return;

  const direction: 'forward' | 'backward' =
    currentIdx < 0 || targetIdx > currentIdx ? 'forward' : 'backward';

  const html = document.documentElement;
  html.dataset['siteTransition'] = direction;

  type DocWithVT = Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  const doc = document as DocWithVT;

  const finish = (): void => {
    delete html.dataset['siteTransition'];
  };

  if (typeof doc.startViewTransition === 'function') {
    const transition = doc.startViewTransition(() => {
      window.location.hash = target;
    });
    transition.finished.finally(finish);
  } else {
    window.location.hash = target;
    requestAnimationFrame(finish);
  }
}

/**
 * Click handler to intercept `<a href="#route">` clicks in favor of the
 * `navigate()` transition. Respects modifier keys (Cmd/Ctrl/Shift/Alt +
 * middle-click) so users can still open in a new tab / background tab.
 */
export function handleSiteLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  target: Page,
): void {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (e.button !== 0) return;
  e.preventDefault();
  navigate(target);
}
