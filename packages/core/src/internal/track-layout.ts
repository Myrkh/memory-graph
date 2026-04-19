/**
 * Pure layout for the AnnotationsTrack side column.
 *
 * Given a chronologically-sorted annotation list and a row step (pixels),
 * produces:
 * - row Y positions (for the lane diamonds)
 * - SVG paths for each unique link (right-curving Bézier between rows)
 *
 * No DOM, no React — the primitive consumes these paths and renders.
 */

import type { Annotation, AnnotationId } from '../types.js';
import { uniqueLinkPairs } from './annotation-layout.js';

export interface TrackRow {
  annotationId: AnnotationId;
  y: number;
}

export interface TrackArc {
  fromId: AnnotationId;
  toId: AnnotationId;
  /** SVG path d attribute, right-curving. */
  d: string;
}

export interface TrackLayout {
  rows: TrackRow[];
  arcs: TrackArc[];
  totalHeight: number;
  /** X coordinate of the lane (where the diamonds sit). */
  laneX: number;
}

const LANE_X = 14;
const ROW_STEP = 72;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 20;
const ARC_BEND_MIN = 20;
const ARC_BEND_MAX = 44;

export function layoutTrack(
  annotations: Annotation[],
  rowStep: number = ROW_STEP,
): TrackLayout {
  const rows: TrackRow[] = annotations.map((a, i) => ({
    annotationId: a.id,
    y: TOP_PADDING + i * rowStep,
  }));
  const rowByAnnotation = new Map<AnnotationId, TrackRow>();
  for (const r of rows) rowByAnnotation.set(r.annotationId, r);

  const asMap = new Map<AnnotationId, Annotation>();
  for (const a of annotations) asMap.set(a.id, a);

  const arcs: TrackArc[] = [];
  for (const [fromId, toId] of uniqueLinkPairs(asMap)) {
    const from = rowByAnnotation.get(fromId);
    const to = rowByAnnotation.get(toId);
    if (!from || !to) continue;
    arcs.push({
      fromId,
      toId,
      d: arcPath(from.y, to.y),
    });
  }

  const totalHeight = Math.max(
    TOP_PADDING + BOTTOM_PADDING,
    rows.length === 0 ? 0 : rows[rows.length - 1]!.y + BOTTOM_PADDING,
  );

  return {
    rows,
    arcs,
    totalHeight,
    laneX: LANE_X,
  };
}

/**
 * Right-curving Bézier from (laneX, fromY) to (laneX, toY). Mirrors the
 * vanilla component's return-edge signature (arcs bend right) so the
 * Track feels like a vertical variant of the main graph's grammar.
 */
function arcPath(fromY: number, toY: number): string {
  const ax = LANE_X;
  const ay = fromY;
  const bx = LANE_X;
  const by = toY;
  const dist = Math.abs(by - ay);
  const bend = Math.max(ARC_BEND_MIN, Math.min(ARC_BEND_MAX, dist * 0.25));
  const ctrlX = ax + bend;
  const ctrlY = (ay + by) / 2;
  return `M ${ax} ${ay} Q ${ctrlX} ${ctrlY} ${bx} ${by}`;
}
