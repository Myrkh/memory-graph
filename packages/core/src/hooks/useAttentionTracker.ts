import { useEffect, useRef, useState, type RefObject } from 'react';
import type { MemoryGraphConfig, ParagraphId } from '../types.js';

export interface UseAttentionTrackerOptions {
  /** Slice of the config actually consumed by the tracker. */
  config: Pick<MemoryGraphConfig, 'DWELL_MS' | 'BAND_RATIO'>;
  /**
   * Called whenever a paragraph loses the "centered" focus.
   * - `dwellMs` is the time spent centered since the last change.
   * - `textContent` is the raw paragraph text; the reducer truncates it.
   * - `paraId` is the value of the `data-mg-id` attribute.
   */
  onCommit: (paraId: ParagraphId, dwellMs: number, textContent: string) => void;
}

export interface UseAttentionTrackerReturn {
  /** The paragraph currently centered in the viewport band, or `null`. */
  currentParaId: ParagraphId | null;
}

const OBSERVER_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

/**
 * Observes `[data-mg-id]` descendants of `containerRef` and emits dwell-time commits
 * whenever the centered paragraph changes. Ports the vanilla observation loop verbatim:
 * IntersectionObserver + scroll (rAF-throttled) + visibilitychange.
 *
 * Children are captured once per mount; dynamic addition of paragraphs requires
 * remounting the hook (key prop) — mirrors the vanilla behavior.
 */
export function useAttentionTracker(
  containerRef: RefObject<HTMLElement | null>,
  options: UseAttentionTrackerOptions,
): UseAttentionTrackerReturn {
  const { config } = options;
  const onCommitRef = useRef(options.onCommit);
  onCommitRef.current = options.onCommit;

  const bandRatioRef = useRef(config.BAND_RATIO);
  bandRatioRef.current = config.BAND_RATIO;

  const [currentParaId, setCurrentParaId] = useState<ParagraphId | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const paragraphs = Array.from(
      container.querySelectorAll<HTMLElement>('[data-mg-id]'),
    );
    if (paragraphs.length === 0) return;

    let currentId: ParagraphId | null = null;
    let entryTime = 0;

    const commitCurrent = (now: number): void => {
      if (currentId && entryTime > 0) {
        const el = paragraphs.find((p) => p.dataset.mgId === currentId);
        const textContent = el?.textContent ?? '';
        onCommitRef.current(currentId, now - entryTime, textContent);
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
    };
  }, [containerRef, config.DWELL_MS]);

  return { currentParaId };
}
