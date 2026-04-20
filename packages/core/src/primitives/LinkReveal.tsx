import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { AnnotationId } from '../types.js';
import { computeRevealPath, isRectOnScreen } from '../internal/link-reveal-geometry.js';
import { useMemoryGraphContext } from './context.js';

export interface LinkRevealProps {
  className?: string;
  style?: CSSProperties;
}

interface RevealPath {
  fromId: AnnotationId;
  toId: AnnotationId;
  d: string;
}

/**
 * Fixed-position SVG overlay that draws a dashed coral arc between the
 * currently-hovered annotation and each of its on-screen link targets.
 * Targets outside the viewport are silently skipped — a future off-screen
 * "whisper" indicator is deferred to v0.3.2.
 *
 * Mount once at the Root level (sibling of Panel / Zone). `pointer-events:
 * none` so it never steals clicks.
 */
export function LinkReveal(props: LinkRevealProps) {
  const { className, style } = props;
  const { hoveredAnnotationId, state, zoneElement } = useMemoryGraphContext();
  const [paths, setPaths] = useState<RevealPath[]>([]);

  const compute = useCallback(() => {
    if (!hoveredAnnotationId) {
      setPaths([]);
      return;
    }
    const annotation = state.annotations.get(hoveredAnnotationId);
    if (!annotation || annotation.links.length === 0) {
      setPaths([]);
      return;
    }
    const zone = zoneElement ?? (typeof document !== 'undefined' ? document.body : null);
    if (!zone) return;

    const fromMark = zone.querySelector<HTMLElement>(
      `[data-mg-annotation-id="${CSS.escape(hoveredAnnotationId)}"]`,
    );
    if (!fromMark) {
      setPaths([]);
      return;
    }
    const fromRect = fromMark.getBoundingClientRect();
    const vh = window.innerHeight;
    if (!isRectOnScreen(fromRect, vh)) {
      setPaths([]);
      return;
    }

    const next: RevealPath[] = [];
    for (const toId of annotation.links) {
      const toMark = zone.querySelector<HTMLElement>(
        `[data-mg-annotation-id="${CSS.escape(toId)}"]`,
      );
      if (!toMark) continue;
      const toRect = toMark.getBoundingClientRect();
      if (!isRectOnScreen(toRect, vh)) continue;
      const { d } = computeRevealPath(fromRect, toRect);
      next.push({ fromId: hoveredAnnotationId, toId, d });
    }
    setPaths(next);
  }, [hoveredAnnotationId, state.annotations, zoneElement]);

  useLayoutEffect(() => {
    compute();
  }, [compute]);

  useEffect(() => {
    if (!hoveredAnnotationId) return;
    const update = (): void => compute();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [compute, hoveredAnnotationId]);

  if (paths.length === 0) return null;

  const base = className ? `mg-link-reveal ${className}` : 'mg-link-reveal';

  return (
    <svg
      className={base}
      style={style}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths.map((p) => (
        <RevealPath key={`${p.fromId}→${p.toId}`} d={p.d} />
      ))}
    </svg>
  );
}

/**
 * Isolated path component so each arc can read its own `getTotalLength()`
 * and expose it to CSS via a custom property. The three-phase draw
 * animation (spec: §IV.Stit'Claude motion signature) needs exact path
 * length — pathLength="N" normalization isn't sufficient because the
 * final dasharray snaps to real pixel values (3/2) at the end.
 */
function RevealPath({ d }: { d: string }) {
  const ref = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    // Rounded to the nearest integer — sub-pixel precision isn't needed,
    // and typed custom-property transitions are happier with integers.
    el.style.setProperty('--mg-pl', String(Math.max(1, Math.round(len))));
  }, [d]);

  return <path ref={ref} className="mg-link-reveal-path" d={d} />;
}
