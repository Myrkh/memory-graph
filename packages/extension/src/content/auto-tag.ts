/**
 * Auto-stamp `data-mg-id` on qualifying text elements before the lib's
 * tracker kicks in. The lib's `useAttentionTracker` observes elements
 * that already have `[data-mg-id]` — for in-page injection we bridge
 * that gap with a pure-DOM helper.
 *
 * Runs once at install time for the current DOM, plus a
 * `MutationObserver` for dynamically-added content (SPA hydration,
 * infinite scroll, inline SSR rehydration).
 */

// `li` catches the bullet-list prose so common in docs sites (Claude,
// Stripe, Next, …). `article` / `section` are included but the
// length filter (`MIN_PARAGRAPH_CHARS`) keeps them from matching when
// they wrap an entire page region — we only want them when they're
// used as leaf content blocks. Kept intentionally tight.
const SELECTORS =
  'p, h1, h2, h3, h4, h5, h6, pre, figure, blockquote, li, article, section';
const MIN_PARAGRAPH_CHARS = 60;
const AUTO_ID_PREFIX = 'mg-auto';

let autoIdCounter = 0;

function ensureId(el: HTMLElement): string {
  const existing = el.dataset['mgId'];
  if (existing) return existing;
  const id = `${AUTO_ID_PREFIX}-${++autoIdCounter}`;
  el.dataset['mgId'] = id;
  return id;
}

function qualifies(el: HTMLElement): boolean {
  const tag = el.tagName;
  if (tag === 'PRE' || tag === 'FIGURE' || tag.startsWith('H')) return true;

  const text = el.textContent?.trim() ?? '';
  if (text.length < MIN_PARAGRAPH_CHARS) return false;

  // Never tag a node whose ancestor chain already has a tagged block —
  // the ancestor represents this content at the right granularity.
  if (el.parentElement?.closest('[data-mg-id]')) return false;

  // Section/article are accepted ONLY when they're leaf-content — if
  // they contain a p/li/h* descendant, let those get tagged instead
  // so we stay at paragraph granularity rather than page-shell level.
  if (tag === 'SECTION' || tag === 'ARTICLE') {
    const leaf = el.querySelector('p, li, h1, h2, h3, h4, h5, h6, pre, figure');
    if (leaf) return false;
  }

  return true;
}

function inferMgKind(el: HTMLElement): string | null {
  const tag = el.tagName;
  if (tag.startsWith('H')) return 'heading';
  if (tag === 'FIGURE') return 'figure';
  if (tag === 'PRE') return 'code';
  return null; // paragraph is the default kind — no attr needed
}

function stampOne(el: HTMLElement): boolean {
  if (!qualifies(el)) return false;
  ensureId(el);
  // Help the lib's kind inference when the tagName is ambiguous —
  // set `data-mg-kind` explicitly on headings, figures, code so
  // `resolveKind(el, 'smart')` returns the expected geometry.
  const kind = inferMgKind(el);
  if (kind && !el.dataset['mgKind']) el.dataset['mgKind'] = kind;
  return true;
}

function stampAllWithin(root: ParentNode): number {
  let count = 0;
  for (const el of root.querySelectorAll<HTMLElement>(SELECTORS)) {
    if (stampOne(el)) count++;
  }
  return count;
}

export function autoTagContent(): void {
  stampAllWithin(document.body);
}

export function watchForAutoTag(): () => void {
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches(SELECTORS)) stampOne(node);
        stampAllWithin(node);
      }
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => mo.disconnect();
}
