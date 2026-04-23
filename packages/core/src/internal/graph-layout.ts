/**
 * Pure layout computation for the Graph primitive. No DOM access, no React —
 * just arithmetic, so it stays unit-testable.
 *
 * Two modes, picked automatically:
 *
 *  · **single-column** (legacy, backward-compatible) — all nodes stack on a
 *    single vertical axis centered at `CENTER_X_RATIO * svgWidth`. Used when
 *    no node has a `route` set (or only one unique route).
 *
 *  · **multi-column** — each unique `route` becomes its own column in
 *    chronological order of first-seen. Node X is anchored on the column
 *    center; Y is still `firstAt`-driven (law 3 preserved). Vertical
 *    stacking (`MIN_NODE_SEPARATION_Y`) is per-column so routes don't push
 *    each other down in time.
 */

import type { AnnotationId, GraphItem, MemoryGraphConfig, ParagraphId } from '../types.js';

/**
 * Strict ego set for chain-highlight. Given a hovered node id:
 * - `nodes` = { hoveredId, ...endpoints of edges TOUCHING hoveredId }
 * - `annotations` = { annotations of hoveredId } ∪
 *                   { annotations linked from hoveredId's annotations }
 *
 * An edge is considered "in-chain" iff one of its endpoints IS hoveredId —
 * not simply "both endpoints happen to be in the set". This answers
 * "where does THIS node go", not "the neighborhood around it".
 */
export interface ChainSet {
  hoveredId: ParagraphId;
  nodes: Set<ParagraphId>;
  annotations: Set<AnnotationId>;
}

export interface Position {
  x: number;
  y: number;
  item: GraphItem;
}

export interface RouteColumn {
  route: string;
  /** Center X of the column (px in svg coords). */
  centerX: number;
  /** Full column width (px). */
  width: number;
  /** Epoch ms of the first node committed to this route — drives column order. */
  firstSeenAt: number;
  /** Index in the ordered column list (0 = leftmost). */
  index: number;
}

export type LayoutConfig = Pick<
  MemoryGraphConfig,
  | 'GRAPH_PADDING_TOP'
  | 'GRAPH_PADDING_BOTTOM'
  | 'MIN_NODE_SEPARATION_Y'
  | 'CENTER_X_RATIO'
  | 'NODE_OFFSET_X'
>;

export interface GraphLayout {
  positions: Map<ParagraphId, Position>;
  totalHeight: number;
  /** Total SVG width — equals svgWidth in single-column mode, or sum of
   * column widths in multi-column mode (≥ svgWidth, enables horizontal scroll). */
  totalWidth: number;
  firstTime: number;
  lastTime: number;
  /** Max of 1000ms and (lastTime - firstTime) — prevents divide-by-zero. */
  duration: number;
  minuteMarks: number[];
  /** Present when multi-column mode is active (≥ 2 unique routes). */
  columns?: RouteColumn[];
}

const TIME_HEIGHT_PX = 600;
const MINUTE_MS = 60_000;
const COLUMN_MIN_WIDTH = 200;

export interface LayoutOptions {
  /** When set, filter items to only stations whose `site` matches ;
   * passages without a site are dropped. Leave undefined to include
   * everything (default — v0.2.0 behaviour). */
  site?: string;
}

/**
 * Compute node positions and the total SVG dimensions for a set of items.
 * Items must already be sorted by `firstAt` ascending.
 */
export function layoutGraph(
  items: GraphItem[],
  svgWidth: number,
  config: LayoutConfig,
  options: LayoutOptions = {},
): GraphLayout | null {
  const { site } = options;
  // Per-site filter keeps BOTH stations and passages whose `site` matches
  // — passages without a site (legacy / pre-v0.3.0) are dropped, which
  // matches the semantics "show the quiet dots of this site only".
  const filtered = site === undefined
    ? items
    : items.filter((it) => it.site === site);
  if (filtered.length === 0) return null;
  items = filtered;

  const firstTime = items[0]!.firstAt;
  const lastTime = items[items.length - 1]!.firstAt;
  const duration = Math.max(1000, lastTime - firstTime);

  // Detect multi-column mode: activate only if ≥ 2 unique routes.
  // Only stations carry `route` (passages are route-agnostic visual dots).
  const routeFirstSeen = new Map<string, number>();
  for (const item of items) {
    const r = item.type === 'station' ? item.route : undefined;
    if (!r) continue;
    if (!routeFirstSeen.has(r)) {
      routeFirstSeen.set(r, item.firstAt);
    }
  }
  const multiColumn = routeFirstSeen.size >= 2;

  const positions = new Map<ParagraphId, Position>();
  const lastYByColumn = new Map<string, number>();
  const SINGLE_COL_KEY = '__single__';

  let columns: RouteColumn[] | undefined;
  let totalWidth = svgWidth;

  if (multiColumn) {
    const sorted = [...routeFirstSeen.entries()].sort((a, b) => a[1] - b[1]);
    const colWidth = Math.max(COLUMN_MIN_WIDTH, svgWidth / sorted.length);
    columns = sorted.map(([route, firstSeenAt], index) => ({
      route,
      centerX: index * colWidth + colWidth / 2,
      width: colWidth,
      firstSeenAt,
      index,
    }));
    totalWidth = sorted.length * colWidth;
  }

  const columnByRoute = new Map<string, RouteColumn>();
  if (columns) for (const c of columns) columnByRoute.set(c.route, c);

  items.forEach((item, i) => {
    const rawY =
      config.GRAPH_PADDING_TOP +
      ((item.firstAt - firstTime) / duration) * TIME_HEIGHT_PX;

    const itemRoute = item.type === 'station' ? item.route : undefined;
    const colKey = multiColumn && itemRoute ? itemRoute : SINGLE_COL_KEY;
    const lastY = lastYByColumn.get(colKey) ?? config.GRAPH_PADDING_TOP;
    const y = Math.max(lastY + config.MIN_NODE_SEPARATION_Y, rawY);

    let centerX: number;
    if (multiColumn && itemRoute && columnByRoute.has(itemRoute)) {
      centerX = columnByRoute.get(itemRoute)!.centerX;
    } else if (multiColumn) {
      // Orphan item (passage, or station with no route) in multi-column
      // mode — park in the first column.
      centerX = columns![0]!.centerX;
    } else {
      centerX = svgWidth * config.CENTER_X_RATIO;
    }
    const x = centerX + (i % 2 === 0 ? -config.NODE_OFFSET_X : config.NODE_OFFSET_X);

    positions.set(item.id, { x, y, item });
    lastYByColumn.set(colKey, y);
  });

  // `totalHeight` = max column height + bottom padding.
  let maxY = config.GRAPH_PADDING_TOP;
  for (const y of lastYByColumn.values()) if (y > maxY) maxY = y;
  const totalHeight = maxY + config.GRAPH_PADDING_BOTTOM;

  const minuteMarks: number[] = [];
  const firstMinute = Math.ceil(firstTime / MINUTE_MS) * MINUTE_MS;
  for (let t = firstMinute; t <= lastTime; t += MINUTE_MS) minuteMarks.push(t);

  return {
    positions,
    totalHeight,
    totalWidth,
    firstTime,
    lastTime,
    duration,
    minuteMarks,
    ...(columns ? { columns } : {}),
  };
}

/**
 * Linearly interpolate a node radius based on its dwell relative to the
 * deepest station. Returns `NODE_R_MIN` when `maxMs` is 0.
 */
export function stationRadius(
  totalMs: number,
  maxMs: number,
  minR: number,
  maxR: number,
): number {
  const norm = Math.min(1, totalMs / Math.max(maxMs, 1));
  return minR + (maxR - minR) * norm;
}

/**
 * Strict ego set for chain-highlight. Given a hovered node id, returns
 * the direct 1-hop neighborhood PLUS the annotations owned by it and
 * those they link to. Pure — unit-testable, no React.
 */
export function computeChainSet(
  hoveredId: ParagraphId,
  edges: readonly import('../types.js').Edge[],
  annotations: ReadonlyMap<string, import('../types.js').Annotation>,
  nodes: ReadonlyMap<ParagraphId, import('../types.js').Node>,
): { hoveredId: ParagraphId; nodes: Set<ParagraphId>; annotations: Set<string> } | null {
  if (!nodes.has(hoveredId)) return null;

  const chainNodes = new Set<ParagraphId>([hoveredId]);
  for (const e of edges) {
    if (e.from === hoveredId) chainNodes.add(e.to);
    if (e.to === hoveredId) chainNodes.add(e.from);
  }

  const hoveredAnnotations = new Set<string>();
  for (const a of annotations.values()) {
    if (a.paraId === hoveredId) hoveredAnnotations.add(a.id);
  }
  const chainAnnotations = new Set<string>(hoveredAnnotations);
  for (const annId of hoveredAnnotations) {
    const ann = annotations.get(annId);
    if (!ann) continue;
    for (const linkedId of ann.links) {
      if (annotations.has(linkedId)) chainAnnotations.add(linkedId);
    }
  }

  return { hoveredId, nodes: chainNodes, annotations: chainAnnotations };
}

/**
 * Produce the unified, sorted list of items to render.
 */
export function buildItems(
  nodes: Map<ParagraphId, import('../types.js').Node>,
  passages: Map<ParagraphId, import('../types.js').Passage>,
  showPassages: boolean,
): GraphItem[] {
  const items: GraphItem[] = [];
  for (const [id, node] of nodes) items.push({ id, type: 'station', ...node });
  if (showPassages) {
    for (const [id, passage] of passages) {
      items.push({
        id,
        type: 'passage',
        firstAt: passage.firstAt,
        extract: passage.extract,
        totalMs: 0,
        visits: 0,
        pinned: false,
        order: -1,
        ...(passage.site !== undefined ? { site: passage.site } : {}),
      });
    }
  }
  items.sort((a, b) => a.firstAt - b.firstAt);
  return items;
}
