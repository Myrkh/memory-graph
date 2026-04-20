import { useEffect, useRef } from 'react';
import type { NodeKind, ParagraphId } from '../types.js';
import {
  resolveStrategy,
  type StrategyInference,
} from '../internal/strategy-inference.js';
import { resolveKind, type KindInference } from '../internal/kind-inference.js';

export interface UseFocusStrategyOptions {
  /** How long keyboard focus must rest before commit fires. Overridable per-element via `data-mg-dwell`. Default 1500. */
  triggerDwellMs: number;
  /** Dwell reported to `onCommit` — set to `DWELL_MS` by the composer so a
   * focused element promotes to a station. Focus is an intent gesture. */
  commitDwellMs: number;
  /** How to decide the strategy when `data-mg-strategy` is absent. Default `'smart'`. */
  inference?: StrategyInference;
  /** How to decide the kind when `data-mg-kind` is absent. Default `'smart'`. */
  kindInference?: KindInference;
  onCommit: (paraId: ParagraphId, dwellMs: number, textContent: string, kind?: NodeKind) => void;
}

/**
 * Focus-dwell strategy. An element is tracked when `resolveStrategy(el,
 * inference)` returns `'focus'`. In smart mode (default), `<input>`,
 * `<textarea>`, `<select>` and `[contenteditable]` are matched
 * implicitly — no `data-mg-strategy` needed.
 *
 * Keyboard focus rests on the element for `data-mg-dwell` ms (default
 * 1500). Blurring before the timer elapses cancels the commit. Uses
 * `focusin`/`focusout` which bubble (delegation-compatible, unlike
 * `focus`/`blur`).
 */
export function useFocusStrategy(
  container: HTMLElement | null,
  options: UseFocusStrategyOptions,
): void {
  const { triggerDwellMs, commitDwellMs, inference = 'smart', kindInference = 'smart' } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;

  useEffect(() => {
    const root = container ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    const timers = new Map<ParagraphId, ReturnType<typeof setTimeout>>();

    const cancel = (paraId: ParagraphId): void => {
      const id = timers.get(paraId);
      if (id !== undefined) {
        clearTimeout(id);
        timers.delete(paraId);
      }
    };

    const resolveEl = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const el = target.closest<HTMLElement>('[data-mg-id]');
      if (!el) return null;
      return resolveStrategy(el, inference) === 'focus' ? el : null;
    };

    const onFocusIn = (e: FocusEvent): void => {
      const el = resolveEl(e.target);
      if (!el) return;
      const paraId = el.dataset.mgId;
      if (!paraId || timers.has(paraId)) return;

      const triggerMs = Number(el.dataset.mgDwell) || triggerDwellMs;
      const kind = resolveKind(el, kindInference);
      const id = setTimeout(() => {
        onCommitRef.current(paraId, commitDwellMs, el.textContent ?? '', kind);
        timers.delete(paraId);
      }, triggerMs);
      timers.set(paraId, id);
    };

    const onFocusOut = (e: FocusEvent): void => {
      const el = resolveEl(e.target);
      if (!el) return;
      const paraId = el.dataset.mgId;
      if (!paraId) return;
      cancel(paraId);
    };

    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    return () => {
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, [container, triggerDwellMs, commitDwellMs, inference, kindInference]);
}
