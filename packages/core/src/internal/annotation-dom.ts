import type { Annotation, AnnotationScope } from '../types.js';

/**
 * DOM-level annotation rendering. Zone calls these functions imperatively
 * on every annotation-state change — that's how we get uniform behavior
 * across ALL `[data-mg-id]` elements, not just those wrapped in
 * `<MemoryGraph.Paragraph>`. Consumers can annotate raw `<aside>`,
 * `<blockquote>`, `<figure>` the same way as `<p>`.
 *
 * Two render paths, matching {@link AnnotationScope}:
 *
 * - `text` → `wrapAnnotationRange(el, a)` emits one `<mark>` per text
 *   chunk the range crosses. Multi-chunk annotations (range spans nested
 *   tags like `<code>`) render as several marks sharing the same
 *   `data-mg-annotation-id`, so hover / link / counterpart still behave
 *   as a single unit.
 * - `block` → `applyBlockAnnotation(el, a)` sets
 *   `data-mg-annotated="block"` on the element itself, styled via CSS as
 *   a coral left stripe + subtle tint.
 *
 * Cleanup is complete: `clearAnnotations(zone)` unwraps every mark and
 * strips every block attr, so the next render is idempotent.
 */

/**
 * `block` when the selection covers the element entirely (from offset 0
 * through the full textContent length), `text` otherwise. Single source
 * of truth — used by SelectionToolbar (at creation) and Zone's linking-
 * mode click handler (when turning a pending selection into a linked
 * annotation). Lives here so there is no duplicated logic.
 */
export function detectScope(
  el: HTMLElement,
  offsetStart: number,
  offsetEnd: number,
): AnnotationScope {
  const full = el.textContent?.length ?? 0;
  return offsetStart === 0 && offsetEnd === full ? 'block' : 'text';
}

export function clearAnnotations(zone: HTMLElement): void {
  // Unwrap inline marks.
  const marks = zone.querySelectorAll<HTMLElement>('mark[data-mg-annotation-id]');
  marks.forEach(unwrap);
  // Strip block attrs.
  const blocks = zone.querySelectorAll<HTMLElement>('[data-mg-id][data-mg-annotated]');
  blocks.forEach((el) => {
    el.removeAttribute('data-mg-annotated');
    el.removeAttribute('data-mg-annotation-id');
    el.removeAttribute('data-mg-has-link');
  });
  // Normalize adjacent text nodes so offsets recompute cleanly next time.
  zone.normalize();
}

export function applyBlockAnnotation(
  el: HTMLElement,
  annotation: Annotation,
): void {
  el.setAttribute('data-mg-annotated', 'block');
  el.setAttribute('data-mg-annotation-id', annotation.id);
  if (annotation.links.length > 0) el.setAttribute('data-mg-has-link', '');
}

/**
 * Wrap every text chunk that falls inside [offsetStart, offsetEnd] with a
 * `<mark>` carrying `data-mg-annotation-id`. Uses a TreeWalker so we can
 * cross element boundaries (Range.surroundContents would throw on partial
 * element wraps).
 */
export function wrapAnnotationRange(
  el: HTMLElement,
  annotation: Annotation,
): void {
  const { offsetStart, offsetEnd } = annotation.selection;
  if (offsetEnd <= offsetStart) return;

  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: { node: Text; start: number; end: number }[] = [];
  let pos = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = node.data.length;
    textNodes.push({ node, start: pos, end: pos + len });
    pos += len;
  }

  for (const { node, start, end } of textNodes) {
    if (end <= offsetStart || start >= offsetEnd) continue;
    // SVG text nodes can't host an HTML `<mark>` — the namespaces clash
    // and browsers render the mark as an unknown SVG element (invisible)
    // or throw. Skip gracefully: the annotation still exists in state
    // and surfaces in the Track / tooltip; only the inline visual inside
    // SVG is dropped. A fully-SVG selection covering its element is
    // detected as `block` scope by `detectScope` and styled via the
    // `[data-mg-annotated="block"]` attribute on the figure, which works
    // everywhere.
    if (node.parentElement?.closest('svg')) continue;

    const localStart = Math.max(offsetStart - start, 0);
    const localEnd = Math.min(offsetEnd - start, end - start);
    if (localEnd <= localStart) continue;

    const range = el.ownerDocument.createRange();
    range.setStart(node, localStart);
    range.setEnd(node, localEnd);

    const mark = el.ownerDocument.createElement('mark');
    mark.className = 'mg-annotation';
    mark.setAttribute('data-mg-annotation-id', annotation.id);
    if (annotation.links.length > 0) mark.setAttribute('data-mg-has-link', '');

    try {
      range.surroundContents(mark);
    } catch {
      // Range refused (e.g., parent is a void element). Skip this chunk.
    }
  }
}

function unwrap(mark: HTMLElement): void {
  const parent = mark.parentNode;
  if (!parent) return;
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
  parent.removeChild(mark);
}
