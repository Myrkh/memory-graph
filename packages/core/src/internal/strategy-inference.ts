import type { NodeStrategy } from '../types.js';

/**
 * Infer a sensible capture strategy for an element based on its tagName
 * and ARIA role. Used by the tracker when `data-mg-strategy` is absent
 * and `strategyInference` is `'smart'` (the default).
 *
 * Rationale: a library that promises "wrap your app once, track
 * anything" must *not* force the consumer to annotate every button with
 * `data-mg-strategy="click"`. Semantic HTML already signals intent —
 * `<button>` is clicked, `<input>` is focused, `<p>` is read. The
 * inference simply reads that intent.
 *
 * Mapping (checked in order):
 * - `<button>`, `<a>`, `<summary>`, `[role="button"|"link"|"menuitem"|"tab"]` → `click`
 * - `<input>`, `<textarea>`, `<select>`, `[contenteditable]` → `focus`
 * - everything else → `viewport`
 *
 * Consumers can override per-element by setting `data-mg-strategy`
 * explicitly, or disable inference globally via
 * `strategyInference: 'explicit'` on the tracker.
 */

const CLICK_TAGS: ReadonlySet<string> = new Set(['BUTTON', 'A', 'SUMMARY']);
const FOCUS_TAGS: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const CLICK_ROLES: ReadonlySet<string> = new Set([
  'button',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
]);

export function inferStrategy(el: HTMLElement): NodeStrategy {
  if (CLICK_TAGS.has(el.tagName)) return 'click';
  if (FOCUS_TAGS.has(el.tagName)) return 'focus';
  if (el.isContentEditable) return 'focus';
  const role = el.getAttribute('role');
  if (role && CLICK_ROLES.has(role)) return 'click';
  return 'viewport';
}

export type StrategyInference = 'smart' | 'explicit';

/**
 * Resolve the effective strategy for an element, combining its explicit
 * `data-mg-strategy` attribute with the inference mode.
 *
 * - `smart`: explicit attr wins, otherwise `inferStrategy(el)`
 * - `explicit`: explicit attr wins, otherwise always `viewport`
 */
export function resolveStrategy(
  el: HTMLElement,
  mode: StrategyInference,
): NodeStrategy {
  const explicit = el.getAttribute('data-mg-strategy') as NodeStrategy | null;
  if (explicit === 'viewport' || explicit === 'hover' || explicit === 'click' || explicit === 'focus') {
    return explicit;
  }
  if (mode === 'explicit') return 'viewport';
  return inferStrategy(el);
}
