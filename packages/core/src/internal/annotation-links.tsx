import type { Annotation, AnnotationId } from '../types.js';
import { uniqueLinkPairs, type SatellitePoint } from './annotation-layout.js';
import type { ChainSet } from '../primitives/Graph.js';

export interface AnnotationLinksProps {
  annotations: Map<AnnotationId, Annotation>;
  satellitePositions: Map<AnnotationId, SatellitePoint>;
  chain?: ChainSet | null;
}

/**
 * SVG layer that renders one cubic-Bézier-ish arc per symmetric link
 * between two annotation satellites. Drawn UNDER the satellites so
 * hover/click stays on the dots, and ABOVE the main forward/return edges
 * so link topology reads as a secondary information layer.
 *
 * No arrowheads: Innovation 04 treats links as symmetric reading
 * connections (spec §04 · "reading connections are mutual").
 */
export function AnnotationLinks(props: AnnotationLinksProps) {
  const { annotations, satellitePositions, chain } = props;
  const pairs = uniqueLinkPairs(annotations);
  if (pairs.length === 0) return null;

  return (
    <g className="mg-annotation-links" aria-hidden>
      {pairs.map(([fromId, toId]) => {
        const from = satellitePositions.get(fromId);
        const to = satellitePositions.get(toId);
        if (!from || !to) return null;
        const inChain = chain
          ? chain.annotations.has(fromId) && chain.annotations.has(toId)
          : false;
        const chainAttr = inChain ? { 'data-mg-chain-connected': '' } : {};
        return (
          <path
            key={`${fromId}→${toId}`}
            className="mg-link-arc"
            d={arcPath(from, to)}
            data-mg-link-from={fromId}
            data-mg-link-to={toId}
            {...chainAttr}
          />
        );
      })}
    </g>
  );
}

/**
 * Quadratic Bézier between two points, bent perpendicular to the chord by
 * ~25% of the chord length. Keeps arcs clearly readable as curves without
 * fighting for space with the main forward/return edges.
 */
function arcPath(a: SatellitePoint, b: SatellitePoint): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.5) {
    // Degenerate (same position) — straight micro-line, harmless.
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const curvature = 0.25;
  // Perpendicular direction to (dx, dy), rotated 90° clockwise.
  const nx = -dy / dist;
  const ny = dx / dist;
  const ctrlX = midX + nx * dist * curvature;
  const ctrlY = midY + ny * dist * curvature;
  return `M ${a.x} ${a.y} Q ${ctrlX} ${ctrlY} ${b.x} ${b.y}`;
}
