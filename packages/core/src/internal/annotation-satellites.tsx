import type { Annotation, AnnotationId, ParagraphId } from '../types.js';
import type { Position } from './graph-layout.js';
import type { HoverState } from '../primitives/context.js';

const ORBIT_RADIUS_MIN = 12;
const ORBIT_RADIUS_MAX = 20;
const DIAMOND_BASE = 4;
const DIAMOND_LARGE = 5;
const MAX_VISIBLE = 8;

export interface AnnotationSatellitesProps {
  positions: Map<ParagraphId, Position>;
  annotations: Map<AnnotationId, Annotation>;
  nodeRadiusFor: (paraId: ParagraphId) => number;
  onHover: (state: HoverState | null) => void;
  onClick: (annotation: Annotation) => void;
}

/**
 * Render one or more coral-diamond satellites per annotated station.
 *
 * - Orbit radius: `nodeR + 12` (min 12, max 20) — scales with node size.
 * - Angles: equal partitions starting at -90° (top) going clockwise.
 * - Max 8 visible; 9+ collapse to a "+N" badge that replaces the last
 *   diamond (spec §03).
 */
export function AnnotationSatellites(props: AnnotationSatellitesProps) {
  const { positions, annotations, nodeRadiusFor, onHover, onClick } = props;

  const groups = groupByParagraph(annotations);
  const renderedGroups: React.ReactNode[] = [];

  groups.forEach((list, paraId) => {
    const pos = positions.get(paraId);
    if (!pos) return;

    const nodeR = nodeRadiusFor(paraId);
    const orbit = Math.max(ORBIT_RADIUS_MIN, Math.min(ORBIT_RADIUS_MAX, nodeR + 12));
    const visible = list.slice(0, MAX_VISIBLE);
    const overflow = list.length - MAX_VISIBLE;

    const satellites = visible.map((annotation, i) => {
      const angle = angleFor(i, visible.length);
      const cx = pos.x + orbit * Math.cos(angle);
      const cy = pos.y + orbit * Math.sin(angle);
      const size = visible.length > 3 ? DIAMOND_LARGE : DIAMOND_BASE;
      const isBadge = overflow > 0 && i === visible.length - 1;

      if (isBadge) {
        return (
          <g
            key={annotation.id}
            className="mg-annotation-satellite mg-annotation-satellite--badge"
            transform={`translate(${cx},${cy})`}
            onClick={() => onClick(annotation)}
            onMouseEnter={(e) =>
              onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
            }
            onMouseLeave={() => onHover(null)}
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
          transform={`translate(${cx},${cy}) rotate(45)`}
          onClick={() => onClick(annotation)}
          onMouseEnter={(e) =>
            onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
          }
          onMouseMove={(e) =>
            onHover({ kind: 'annotation', annotation, clientX: e.clientX, clientY: e.clientY })
          }
          onMouseLeave={() => onHover(null)}
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

    renderedGroups.push(<g key={paraId}>{satellites}</g>);
  });

  return <g className="mg-annotation-satellites">{renderedGroups}</g>;
}

function groupByParagraph(
  annotations: Map<AnnotationId, Annotation>,
): Map<ParagraphId, Annotation[]> {
  const groups = new Map<ParagraphId, Annotation[]>();
  for (const a of annotations.values()) {
    const list = groups.get(a.paraId);
    if (list) list.push(a);
    else groups.set(a.paraId, [a]);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.createdAt - b.createdAt);
  }
  return groups;
}

function angleFor(i: number, n: number): number {
  const start = -Math.PI / 2;
  const step = (2 * Math.PI) / Math.max(n, 1);
  return start + i * step;
}
