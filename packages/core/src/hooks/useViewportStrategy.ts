import { useEffect, useRef, useState } from 'react';
import type { MemoryGraphConfig, NodeKind, ParagraphId } from '../types.js';
import {
  resolveStrategy,
  type StrategyInference,
} from '../internal/strategy-inference.js';
import { resolveKind, type KindInference } from '../internal/kind-inference.js';

export interface UseViewportStrategyOptions {
  config: Pick<MemoryGraphConfig, 'DWELL_MS' | 'BAND_RATIO'>;
  /** How to decide the strategy when `data-mg-strategy` is absent. Default `'smart'`. */
  inference?: StrategyInference;
  /** How to decide the kind when `data-mg-kind` is absent. Default `'smart'`. */
  kindInference?: KindInference;
  /** Abstract route bucket stamped on every committed node. Passes through from `<Root route="…">`. */
  route?: string;
  onCommit: (
    paraId: ParagraphId,
    dwellMs: number,
    textContent: string,
    kind?: NodeKind,
    route?: string,
  ) => void;
}

export interface UseViewportStrategyReturn {
  currentParaId: ParagraphId | null;
}

const OBSERVER_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

/**
 * Viewport-dwell strategy: the canonical reading-mode capture. An element
 * is tracked when `resolveStrategy(el, inference)` returns `'viewport'`.
 * Under the default smart mode: elements without `data-mg-strategy` AND
 * not semantically actionable (no `<button>`, `<a>`, `<input>`…) are
 * considered viewport.
 *
 * Mechanics: IntersectionObserver + scroll (rAF-throttled) +
 * visibilitychange; the paragraph whose center sits inside the attention
 * band (vertical strip of `BAND_RATIO * innerHeight`) is current. Leaving
 * the band commits the dwell; `>= DWELL_MS` promotes to a station.
 */
export function useViewportStrategy(
  container: HTMLElement | null,
  options: UseViewportStrategyOptions,
): UseViewportStrategyReturn {
  const { config, inference = 'smart', kindInference = 'smart', route } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;
  const routeRef = useRef(route);
  routeRef.current = route;

  const bandRatioRef = useRef(config.BAND_RATIO);
  bandRatioRef.current = config.BAND_RATIO;

  const [currentParaId, setCurrentParaId] = useState<ParagraphId | null>(null);

  useEffect(() => {
    const root = container ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    const paragraphs = Array.from(
      root.querySelectorAll<HTMLElement>('[data-mg-id]'),
    ).filter((el) => resolveStrategy(el, inference) === 'viewport');
    if (paragraphs.length === 0) return;

    let currentId: ParagraphId | null = null;
    let entryTime = 0;

    const commitCurrent = (now: number): void => {
      if (currentId && entryTime > 0) {
        const el = paragraphs.find((p) => p.dataset.mgId === currentId);
        const textContent = el?.textContent ?? '';
        const kind = el ? resolveKind(el, kindInference) : undefined;
        onCommitRef.current(currentId, now - entryTime, textContent, kind, routeRef.current);
      }
    };

    const handleEnter = (nextId: ParagraphId | null): void => {
      if (nextId === currentId) return;
      const now = Date.now();
      commitCurrent(now);
      currentId = nextId;
      entryTime = nextId ? now : 0;
      setCurrentParaId(nextId);
    };

    const detectCentered = (): ParagraphId | null => {
      const h = window.innerHeight;
      const bandHalf = (h * bandRatioRef.current) / 2;
      const bandTop = h / 2 - bandHalf;
      const bandBottom = h / 2 + bandHalf;
      let bestId: ParagraphId | null = null;
      let bestDist = Infinity;
      for (const p of paragraphs) {
        const r = p.getBoundingClientRect();
        const center = r.top + r.height / 2;
        if (center >= bandTop && center <= bandBottom) {
          const dist = Math.abs(center - h / 2);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = p.dataset.mgId ?? null;
          }
        }
      }
      return bestId;
    };

    const io = new IntersectionObserver(
      () => handleEnter(detectCentered()),
      { threshold: OBSERVER_THRESHOLDS, rootMargin: '0px' },
    );
    for (const p of paragraphs) io.observe(p);

    let rafId = 0;
    const onScroll = (): void => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        handleEnter(detectCentered());
      });
    };
    document.addEventListener('scroll', onScroll, { passive: true });

    const onVisibility = (): void => {
      if (document.hidden && currentId && entryTime > 0) {
        const now = Date.now();
        commitCurrent(now);
        entryTime = now;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    handleEnter(detectCentered());

    return () => {
      commitCurrent(Date.now());
      io.disconnect();
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (rafId) cancelAnimationFrame(rafId);
      setCurrentParaId(null);
    };
  }, [container, config.DWELL_MS, inference, kindInference]);

  return { currentParaId };
}
