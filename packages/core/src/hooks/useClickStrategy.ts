import { useEffect, useRef } from 'react';
import type { NodeKind, ParagraphId } from '../types.js';
import {
  resolveStrategy,
  type StrategyInference,
} from '../internal/strategy-inference.js';
import { resolveKind, type KindInference } from '../internal/kind-inference.js';

export interface UseClickStrategyOptions {
  /** Synthetic dwell (ms) attributed to a click. Promotes the node to a
   * station immediately when `>= DWELL_MS`. Default = `DWELL_MS`. */
  commitDwellMs: number;
  /** How to decide the strategy when `data-mg-strategy` is absent. Default `'smart'`. */
  inference?: StrategyInference;
  /** How to decide the kind when `data-mg-kind` is absent. Default `'smart'`. */
  kindInference?: KindInference;
  /** Abstract route bucket stamped on every committed node. */
  route?: string;
  /** Abstract site bucket (one level above route). */
  site?: string;
  onCommit: (
    paraId: ParagraphId,
    dwellMs: number,
    textContent: string,
    kind?: NodeKind,
    route?: string,
    site?: string,
  ) => void;
}

/**
 * Click strategy. An element is tracked when `resolveStrategy(el,
 * inference)` returns `'click'`. In smart mode (default), `<button>`,
 * `<a>`, `<summary>` and elements with `role="button|link|menuitem|tab"`
 * are matched implicitly — no `data-mg-strategy` needed.
 *
 * Commits with a synthetic dwell (default `DWELL_MS`) so a clicked node
 * becomes a station instantly — "I went here" is a stronger signal than
 * "I lingered on screen".
 */
export function useClickStrategy(
  container: HTMLElement | null,
  options: UseClickStrategyOptions,
): void {
  const { commitDwellMs, inference = 'smart', kindInference = 'smart', route, site } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;
  const routeRef = useRef(route);
  routeRef.current = route;
  const siteRef = useRef(site);
  siteRef.current = site;

  useEffect(() => {
    const root = container ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    const onClick = (e: MouseEvent): void => {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>('[data-mg-id]');
      if (!el) return;
      if (resolveStrategy(el, inference) !== 'click') return;
      const paraId = el.dataset.mgId;
      if (!paraId) return;
      const dwellMs = Number(el.dataset.mgDwell) || commitDwellMs;
      const kind = resolveKind(el, kindInference);
      onCommitRef.current(
        paraId,
        dwellMs,
        el.textContent ?? '',
        kind,
        routeRef.current,
        siteRef.current,
      );
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [container, commitDwellMs, inference, kindInference]);
}
