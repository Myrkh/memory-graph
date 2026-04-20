import { useEffect, useRef } from 'react';
import type { NodeKind, ParagraphId } from '../types.js';
import {
  resolveStrategy,
  type StrategyInference,
} from '../internal/strategy-inference.js';
import { resolveKind, type KindInference } from '../internal/kind-inference.js';

export interface UseHoverStrategyOptions {
  /** How long the user must hover before the commit fires. Overridable per-element via `data-mg-dwell`. Default 1500. */
  triggerDwellMs: number;
  /** Dwell reported to `onCommit` once the trigger elapses — set to `DWELL_MS`
   * by the tracker composer so a hovered element promotes to a station,
   * not a passage. Hover is an intent gesture, not a reading moment. */
  commitDwellMs: number;
  /** How to decide the strategy when `data-mg-strategy` is absent. Default `'smart'`. */
  inference?: StrategyInference;
  /** How to decide the kind when `data-mg-kind` is absent. Default `'smart'`. */
  kindInference?: KindInference;
  /** Abstract route bucket stamped on every committed node. */
  route?: string;
  onCommit: (
    paraId: ParagraphId,
    dwellMs: number,
    textContent: string,
    kind?: NodeKind,
    route?: string,
  ) => void;
}

/**
 * Hover-dwell strategy. An element is tracked when `resolveStrategy(el,
 * inference)` returns `'hover'` — which in smart mode today requires an
 * explicit `data-mg-strategy="hover"` (no tagName maps to hover
 * implicitly, since "cursor rests on it" is never the default).
 *
 * Pointer rests on the element for `data-mg-dwell` ms (default 1500).
 * Leaving before the timer elapses cancels the commit; re-entering starts
 * a fresh timer. Implemented with delegation so dynamic elements are
 * handled without a MutationObserver.
 */
export function useHoverStrategy(
  container: HTMLElement | null,
  options: UseHoverStrategyOptions,
): void {
  const {
    triggerDwellMs,
    commitDwellMs,
    inference = 'smart',
    kindInference = 'smart',
    route,
  } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;
  const routeRef = useRef(route);
  routeRef.current = route;

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
      return resolveStrategy(el, inference) === 'hover' ? el : null;
    };

    const onOver = (e: PointerEvent): void => {
      const el = resolveEl(e.target);
      if (!el) return;
      const paraId = el.dataset.mgId;
      if (!paraId || timers.has(paraId)) return;

      const triggerMs = Number(el.dataset.mgDwell) || triggerDwellMs;
      const kind = resolveKind(el, kindInference);
      const id = setTimeout(() => {
        onCommitRef.current(
          paraId,
          commitDwellMs,
          el.textContent ?? '',
          kind,
          routeRef.current,
        );
        timers.delete(paraId);
      }, triggerMs);
      timers.set(paraId, id);
    };

    const onOut = (e: PointerEvent): void => {
      const el = resolveEl(e.target);
      if (!el) return;
      const paraId = el.dataset.mgId;
      if (!paraId) return;
      const related = e.relatedTarget;
      if (related instanceof Node && el.contains(related)) return;
      cancel(paraId);
    };

    root.addEventListener('pointerover', onOver);
    root.addEventListener('pointerout', onOut);

    return () => {
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('pointerout', onOut);
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, [container, triggerDwellMs, commitDwellMs, inference, kindInference]);
}
