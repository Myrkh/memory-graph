import type { Annotation, AnnotationId, ParagraphId } from '../types.js';
import {
  MAX_VISIBLE_SATELLITES,
  groupByParagraph,
  type SatellitePoint,
} from './annotation-layout.js';
import type { HoverState } from '../primitives/context.js';
import type { ChainSet } from '../primitives/Graph.js';

const DIAMOND_BASE = 4;
const DIAMOND_LARGE = 5;

export interface AnnotationSatellitesProps {
  annotations: Map<AnnotationId, Annotation>;
  satellitePositions: Map<AnnotationId, SatellitePoint>;
  chain?: ChainSet | null;
  onHover: (state: HoverState | null) => void;
  onClick: (annotation: Annotation) => void;
}

/**
 * Render one or more coral-diamond satellites per annotated station.
 *
 * Positions are fed by {@link computeSatellitePositions} so this component
 * doesn't duplicate the orbit math. When a paragraph has more than
 * `MAX_VISIBLE_SATELLITES` annotations, the last diamond is replaced by a
 * "+N" badge; overflow annotations remain in the passed-in map so they can
 * still be acted on when the badge is clicked.
 */
export function AnnotationSatellites(props: AnnotationSatellitesProps) {
  const { annotations, satellitePositions, chain, onHover, onClick } = props;
  const grouped = groupByParagraph(annotations);
  const out: React.ReactNode[] = [];

  grouped.forEach((list, paraId) => {
    const visibleCount = Math.min(list.length, MAX_VISIBLE_SATELLITES);
    const overflow = list.length - visibleCount;

    const rendered = list.slice(0, visibleCount).map((annotation, i) => {
      const pt = satellitePositions.get(annotation.id);
      if (!pt) return null;
      const size = visibleCount > 3 ? DIAMOND_LARGE : DIAMOND_BASE;
      const isBadge = overflow > 0 && i === visibleCount - 1;
      const chainAttr = chain && chain.annotations.has(annotation.id)
        ? { 'data-mg-chain-connected': '' }
        : {};

      if (isBadge) {
        return (
          <g
            key={annotation.id}
            className="mg-annotation-satellite mg-annotation-satellite--badge"
            data-mg-annotation-id={annotation.id}
            transform={`translate(${pt.x},${pt.y})`}
            onClick={() => onClick(annotation)}
            onMouseEnter={(e) =>
              onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
            }
            onMouseLeave={() => onHover(null)}
            {...chainAttr}
          >
            <circle r={size + 2} className="mg-annotation-satellite__bg" />
            <text className="mg-annotation-satellite__badge-text" y={1}>
              +{overflow + 1}
            </text>
          </g>
        );
      }

      return (
        <g
          key={annotation.id}
          className="mg-annotation-satellite"
          data-mg-annotation-id={annotation.id}
          transform={`translate(${pt.x},${pt.y}) rotate(45)`}
          onClick={() => onClick(annotation)}
          onMouseEnter={(e) =>
            onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
          }
          onMouseMove={(e) =>
            onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
          }
          onMouseLeave={() => onHover(null)}
          {...chainAttr}
        >
          <rect
            className="mg-annotation-satellite__shape"
            x={-size}
            y={-size}
            width={size * 2}
            height={size * 2}
          />
        </g>
      );
    });

    out.push(<g key={paraId}>{rendered}</g>);
  });

  return <g className="mg-annotation-satellites">{out}</g>;
}

// Re-export so Graph.tsx can pass the right prop without importing internals
export type { ParagraphId };
