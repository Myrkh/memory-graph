import { useCallback, useState, type RefObject } from 'react';
import type { GraphLayout } from '../internal/graph-layout.js';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 1.25;
const FIT_PADDING = 24;
const BLUR_MS = 320;

export interface UseGraphZoomReturn {
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
}

/**
 * Zoom state + controls for the Graph primitive. Local state (not in the
 * reducer — zoom is a view concern, not a persisted data-model field).
 * Clamped to [0.5, 2.5] with 1.25× step.
 *
 * Strategy · focal-point preservation. When zooming, the SVG coordinate
 * currently at the center of the visible viewport stays at the center.
 * The new scrollLeft/Top is computed from the focal coord × new zoom,
 * minus half the viewport, then applied on the next frame (after React
 * has rendered the new SVG dimensions) via `scrollTo({behavior:'smooth'})`.
 * A `data-mg-zooming` flag is flipped on the SVG for BLUR_MS so the CSS
 * can apply a brief blur that masks any transient jitter during the
 * parallel zoom + scroll transitions. `fit()` resets to (0, 0).
 */
export function useGraphZoom(
  wrapRef: RefObject<HTMLDivElement | null>,
  layout: GraphLayout | null,
): UseGraphZoomReturn {
  const [zoom, setZoom] = useState(1);

  const applyZoom = useCallback(
    (factor: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      setZoom((currentZoom) => {
        const nextZoom = Math.max(
          ZOOM_MIN,
          Math.min(ZOOM_MAX, currentZoom * factor),
        );
        if (nextZoom === currentZoom) return currentZoom;

        const wrapW = wrap.clientWidth;
        const wrapH = wrap.clientHeight;
        const svg = wrap.querySelector<SVGSVGElement>('.mg-svg');

        // Read the ACTUAL rendered SVG size — not state — so the focal
        // point stays accurate even when a previous zoom is still mid-
        // transition. Without this, rapid repeat clicks cause a jolt
        // because state is already at the target but the DOM is not.
        const effectiveZoom =
          svg && layout
            ? svg.getBoundingClientRect().width / layout.totalWidth
            : currentZoom;
        const focalX = (wrap.scrollLeft + wrapW / 2) / effectiveZoom;
        const focalY = (wrap.scrollTop + wrapH / 2) / effectiveZoom;

        if (svg) {
          svg.setAttribute('data-mg-zooming', '');
          window.setTimeout(
            () => svg.removeAttribute('data-mg-zooming'),
            BLUR_MS,
          );
        }

        requestAnimationFrame(() => {
          const targetX = Math.max(0, focalX * nextZoom - wrapW / 2);
          const targetY = Math.max(0, focalY * nextZoom - wrapH / 2);
          wrap.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });
        });

        return nextZoom;
      });
    },
    [layout, wrapRef],
  );

  const zoomIn = useCallback(() => applyZoom(ZOOM_STEP), [applyZoom]);
  const zoomOut = useCallback(() => applyZoom(1 / ZOOM_STEP), [applyZoom]);

  const fit = useCallback(() => {
    if (!layout || !wrapRef.current) return;
    const avail = wrapRef.current.clientWidth - FIT_PADDING;
    const fitZoom = Math.min(avail / layout.totalWidth, 1);
    const clamped = Math.max(ZOOM_MIN, fitZoom);
    setZoom(clamped);
    wrapRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [layout, wrapRef]);

  return {
    zoom,
    canZoomIn: zoom < ZOOM_MAX,
    canZoomOut: zoom > ZOOM_MIN,
    zoomIn,
    zoomOut,
    fit,
  };
}
