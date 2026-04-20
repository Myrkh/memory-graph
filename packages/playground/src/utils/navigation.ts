import type { MouseEvent } from 'react';

/**
 * Canonical page order. Drives the directional slide on route change —
 * moving to a higher index slides the new page in from the right (forward);
 * moving to a lower index slides it in from the left (backward).
 */
export const PAGE_ORDER = ['home', 'demo', 'docs', 'philosophy'] as const;
export type Page = (typeof PAGE_ORDER)[number];

const PAGE_SET: ReadonlySet<string> = new Set(PAGE_ORDER);

export function isPage(value: string): value is Page {
  return PAGE_SET.has(value);
}

/** Map a pathname (e.g. `/demo`) to a canonical `Page`. Falls back to `home`. */
export function pageFromPathname(pathname: string): Page {
  const segment = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? '';
  if (isPage(segment)) return segment;
  return 'home';
}

/** Build a canonical URL path for a page. `home` → `/`, others → `/<page>`. */
export function pathFromPage(page: Page): string {
  return page === 'home' ? '/' : `/${page}`;
}

/**
 * Navigate to a site page with a directional view transition. Works as a
 * progressive enhancement: browsers that support the View Transitions API
 * (Chrome 111+, Safari 18.2+, Firefox 139+) get a horizontal slide whose
 * direction matches the page order; older browsers just push a history
 * entry and re-render.
 *
 * Uses the History API (pushState) instead of hash routing so each page
 * has its own crawlable URL (`/`, `/demo`, `/docs`, `/philosophy`) and
 * can be indexed by Google as a distinct document. The `popstate`
 * listener in `App.tsx` handles back/forward navigation.
 */
export function navigate(target: Page): void {
  if (typeof window === 'undefined') return;
  const currentPage = pageFromPathname(window.location.pathname);
  if (currentPage === target) return;

  const currentIdx = (PAGE_ORDER as readonly string[]).indexOf(currentPage);
  const targetIdx = (PAGE_ORDER as readonly string[]).indexOf(target);
  if (targetIdx === -1) return;

  const direction: 'forward' | 'backward' =
    targetIdx > currentIdx ? 'forward' : 'backward';

  const html = document.documentElement;
  html.dataset['siteTransition'] = direction;

  type DocWithVT = Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  const doc = document as DocWithVT;

  const commit = (): void => {
    window.history.pushState({ page: target }, '', pathFromPage(target));
    // Notify any listener (App's popstate polyfill) that we navigated.
    window.dispatchEvent(new PopStateEvent('popstate', { state: { page: target } }));
  };

  const finish = (): void => {
    delete html.dataset['siteTransition'];
  };

  if (typeof doc.startViewTransition === 'function') {
    const transition = doc.startViewTransition(commit);
    transition.finished.finally(finish);
  } else {
    commit();
    requestAnimationFrame(finish);
  }
}

/**
 * Click handler to intercept `<a href="/route">` clicks in favor of the
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
