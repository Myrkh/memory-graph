import type { NodeKind } from '../types.js';

/**
 * Infer a node's visual kind from its tagName. Used at commit time, under
 * the default smart inference mode, when `data-mg-kind` is absent. Gives
 * zero-annotation ergonomics matching `strategy-inference.ts`: the
 * semantic tag already signals what the element *is*, we just surface it
 * in the graph's geometry.
 *
 * Mapping (checked in order):
 * - `<h1>`-`<h6>`, `[role="heading"]`              → `heading`
 * - `<figure>`, `<img>`, `<picture>`, `<video>`    → `figure`
 * - `<pre>`, standalone `<code>` (block-level)     → `code`
 * - everything else                                → `paragraph`
 *
 * `kpi` has no tag that maps to it semantically — set it explicitly via
 * `data-mg-kind="kpi"` on dashboard datapoints.
 *
 * Consumers can disable inference (`kindInference: 'explicit'`) to force
 * the default `paragraph` kind unless `data-mg-kind` is set.
 */

const HEADING_TAGS: ReadonlySet<string> = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const FIGURE_TAGS: ReadonlySet<string> = new Set(['FIGURE', 'IMG', 'PICTURE', 'VIDEO']);
const CODE_TAGS: ReadonlySet<string> = new Set(['PRE']);

export function inferKind(el: HTMLElement): NodeKind {
  if (HEADING_TAGS.has(el.tagName)) return 'heading';
  if (el.getAttribute('role') === 'heading') return 'heading';
  if (FIGURE_TAGS.has(el.tagName)) return 'figure';
  if (CODE_TAGS.has(el.tagName)) return 'code';
  // Block-level `<code>` (not inline inside a paragraph) — rare but a few
  // authors write `<code>…</code>` as a standalone block.
  if (el.tagName === 'CODE' && el.parentElement?.tagName !== 'PRE') {
    const style = el.ownerDocument.defaultView?.getComputedStyle(el);
    if (style?.display === 'block') return 'code';
  }
  return 'paragraph';
}

export type KindInference = 'smart' | 'explicit';

/**
 * Resolve the effective kind for an element, combining `data-mg-kind`
 * with the inference mode. Mirrors `resolveStrategy`.
 */
export function resolveKind(el: HTMLElement, mode: KindInference): NodeKind {
  const explicit = el.getAttribute('data-mg-kind') as NodeKind | null;
  if (
    explicit === 'paragraph' ||
    explicit === 'heading' ||
    explicit === 'kpi' ||
    explicit === 'figure' ||
    explicit === 'code'
  ) {
    return explicit;
  }
  if (mode === 'explicit') return 'paragraph';
  return inferKind(el);
}
