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
  /** Abstract site bucket (one level above route). Passes through from `<Root site="…">`. */
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

export interface UseViewportStrategyReturn {
  currentParaId: ParagraphId | null;
}

const OBSERVER_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

/**
 * Viewport-dwell strategy — the canonical reading-mode capture.
 * Dynamic-DOM aware : a `MutationObserver` picks up `[data-mg-id]`
 * elements added AFTER mount (SPA hydration, load-more, infinite
 * scroll) and attaches them to the live IntersectionObserver. On
 * removal the cleanup commits the current dwell first, then detaches.
 *
 * Attention-band mechanics unchanged : the paragraph whose center sits
 * inside the vertical strip of `BAND_RATIO * innerHeight` is current.
 * Leaving the band commits the dwell ; `≥ DWELL_MS` promotes to a
 * station, otherwise a passage.
 */
export function useViewportStrategy(
  container: HTMLElement | null,
  options: UseViewportStrategyOptions,
): UseViewportStrategyReturn {
  const { config, inference = 'smart', kindInference = 'smart', route, site } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;
  const routeRef = useRef(route);
  routeRef.current = route;
  const siteRef = useRef(site);
  siteRef.current = site;

  const bandRatioRef = useRef(config.BAND_RATIO);
  bandRatioRef.current = config.BAND_RATIO;

  const [currentParaId, setCurrentParaId] = useState<ParagraphId | null>(null);

  useEffect(() => {
    const root = container ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    // Live, mutable tracking set · seeded from the initial DOM and
    // kept in sync by the MutationObserver below.
    const observed = new Set<HTMLElement>();
    const candidates: HTMLElement[] = [];

    let currentId: ParagraphId | null = null;
    let entryTime = 0;

    const commitCurrent = (now: number): void => {
      if (!currentId || entryTime === 0) return;
      const el = candidates.find((p) => p.dataset['mgId'] === currentId);
      // Forward every dwell — reducer classifies passage vs station.
      // textContent from a detached element still returns the cached
      // string, so late-SPA-detaching is safe.
      const textContent = el?.textContent ?? '';
      const kind = el ? resolveKind(el, kindInference) : undefined;
      onCommitRef.current(
        currentId,
        now - entryTime,
        textContent,
        kind,
        routeRef.current,
        siteRef.current,
      );
    };

    const detectCentered = (): ParagraphId | null => {
      const h = window.innerHeight;
      const bandHalf = (h * bandRatioRef.current) / 2;
      const bandTop = h / 2 - bandHalf;
      const bandBottom = h / 2 + bandHalf;
      let bestId: ParagraphId | null = null;
      let bestDist = Infinity;
      for (const p of candidates) {
        const r = p.getBoundingClientRect();
        const center = r.top + r.height / 2;
        if (center >= bandTop && center <= bandBottom) {
          const dist = Math.abs(center - h / 2);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = p.dataset['mgId'] ?? null;
          }
        }
      }
      return bestId;
    };

    const handleEnter = (nextId: ParagraphId | null): void => {
      if (nextId === currentId) return;
      const now = Date.now();
      commitCurrent(now);
      currentId = nextId;
      entryTime = nextId ? now : 0;
      setCurrentParaId(nextId);
    };

    const io = new IntersectionObserver(
      () => handleEnter(detectCentered()),
      { threshold: OBSERVER_THRESHOLDS, rootMargin: '0px' },
    );

    const observeNew = (els: HTMLElement[]): number => {
      let added = 0;
      for (const el of els) {
        if (observed.has(el)) continue;
        if (resolveStrategy(el, inference) !== 'viewport') continue;
        observed.add(el);
        candidates.push(el);
        io.observe(el);
        added++;
      }
      return added;
    };

    // Initial scan — may be zero on SPAs that hydrate after mount.
    observeNew(Array.from(root.querySelectorAll<HTMLElement>('[data-mg-id]')));

    // MutationObserver · keeps the tracker in sync with dynamic DOM
    // additions / removals. Before the pivot the hook returned early
    // on zero initial matches, silently dropping every SPA-hydrated
    // paragraph ; this observer closes that loop.
    const mo = new MutationObserver((mutations) => {
      const added: HTMLElement[] = [];
      const removed: HTMLElement[] = [];
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.hasAttribute('data-mg-id')) added.push(node);
          added.push(
            ...Array.from(node.querySelectorAll<HTMLElement>('[data-mg-id]')),
          );
        }
        for (const node of m.removedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.dataset['mgId']) removed.push(node);
          removed.push(
            ...Array.from(node.querySelectorAll<HTMLElement>('[data-mg-id]')),
          );
        }
      }

      if (removed.length > 0) {
        const removedIds = new Set(
          removed.map((el) => el.dataset['mgId']).filter(Boolean),
        );
        // Commit the current dwell BEFORE the element disappears.
        if (currentId && removedIds.has(currentId)) {
          commitCurrent(Date.now());
          currentId = null;
          entryTime = 0;
          setCurrentParaId(null);
        }
        for (const el of removed) {
          observed.delete(el);
          const idx = candidates.indexOf(el);
          if (idx >= 0) candidates.splice(idx, 1);
          io.unobserve(el);
        }
      }

      if (added.length > 0 && observeNew(added) > 0) {
        handleEnter(detectCentered());
      }
    });
    mo.observe(root, { childList: true, subtree: true });

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
      mo.disconnect();
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (rafId) cancelAnimationFrame(rafId);
      setCurrentParaId(null);
    };
  }, [container, config.DWELL_MS, inference, kindInference]);

  return { currentParaId };
}
