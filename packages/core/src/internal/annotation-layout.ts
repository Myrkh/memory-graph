/**
 * Shared satellite-position computation for the graph's annotation layers.
 * Pure math — no DOM, no React — so both `AnnotationSatellites` (diamond
 * dots) and `AnnotationLinks` (arcs between linked annotations) resolve
 * positions from a single source of truth.
 */

import type { Annotation, AnnotationId, ParagraphId } from '../types.js';
import type { Position } from './graph-layout.js';

export const ORBIT_RADIUS_MIN = 12;
export const ORBIT_RADIUS_MAX = 20;
export const ORBIT_NODE_PADDING = 12;
export const MAX_VISIBLE_SATELLITES = 8;

export interface SatellitePoint {
  x: number;
  y: number;
  parentParaId: ParagraphId;
  /** Index of this satellite among its siblings (0-based). */
  indexWithinGroup: number;
  /** Total siblings in this paragraph's group (capped at MAX_VISIBLE_SATELLITES). */
  groupSize: number;
}

/**
 * Build the {@link SatellitePoint} map for the given annotations.
 *
 * - Groups annotations by their parent paragraph.
 * - Sorts each group by `createdAt` ascending (stable left-edge-first order).
 * - Caps each group at `MAX_VISIBLE_SATELLITES` — overflow satellites are
 *   still included in the returned map so hover/click logic can target them;
 *   the visual renderer decides whether to collapse them into a badge.
 * - Places each satellite at an equal-angle partition of the orbit circle,
 *   starting at -90° (top) going clockwise.
 */
export function computeSatellitePositions(
  positions: Map<ParagraphId, Position>,
  annotations: Map<AnnotationId, Annotation>,
  nodeRadiusFor: (paraId: ParagraphId) => number,
): Map<AnnotationId, SatellitePoint> {
  const grouped = groupByParagraph(annotations);
  const out = new Map<AnnotationId, SatellitePoint>();

  grouped.forEach((list, paraId) => {
    const parentPos = positions.get(paraId);
    if (!parentPos) return;

    const nodeR = nodeRadiusFor(paraId);
    const orbit = Math.max(
      ORBIT_RADIUS_MIN,
      Math.min(ORBIT_RADIUS_MAX, nodeR + ORBIT_NODE_PADDING),
    );

    const visibleCount = Math.min(list.length, MAX_VISIBLE_SATELLITES);
    list.forEach((annotation, i) => {
      const angle = angleFor(i, visibleCount);
      out.set(annotation.id, {
        x: parentPos.x + orbit * Math.cos(angle),
        y: parentPos.y + orbit * Math.sin(angle),
        parentParaId: paraId,
        indexWithinGroup: i,
        groupSize: visibleCount,
      });
    });
  });

  return out;
}

export function groupByParagraph(
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

/**
 * Compute the unique pairs `[fromId, toId]` for every symmetric link.
 * Emits each pair once (lexicographic order on ids) so arc rendering
 * doesn't duplicate reciprocal links.
 */
export function uniqueLinkPairs(
  annotations: Map<AnnotationId, Annotation>,
): Array<[AnnotationId, AnnotationId]> {
  const pairs: Array<[AnnotationId, AnnotationId]> = [];
  const seen = new Set<string>();
  for (const [id, annotation] of annotations) {
    for (const otherId of annotation.links) {
      if (!annotations.has(otherId)) continue;
      const lo = id < otherId ? id : otherId;
      const hi = id < otherId ? otherId : id;
      const key = `${lo}→${hi}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([lo, hi]);
    }
  }
  return pairs;
}
