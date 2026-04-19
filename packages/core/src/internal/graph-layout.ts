/**
 * Pure layout computation for the Graph primitive. No DOM access, no React —
 * just arithmetic, so it stays unit-testable.
 *
 * Mirrors the vanilla `renderGraph()` positioning logic (reference-vanilla.html
 * lines 1680–1720).
 */

import type { GraphItem, MemoryGraphConfig, ParagraphId } from '../types.js';

export interface Position {
  x: number;
  y: number;
  item: GraphItem;
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
  firstTime: number;
  lastTime: number;
  /** Max of 1000ms and (lastTime - firstTime) — prevents divide-by-zero. */
  duration: number;
  minuteMarks: number[];
}

const TIME_HEIGHT_PX = 600;
const MINUTE_MS = 60_000;

/**
 * Compute node positions and the total SVG height for a set of items.
 * Items must already be sorted by `firstAt` ascending.
 */
export function layoutGraph(
  items: GraphItem[],
  svgWidth: number,
  config: LayoutConfig,
): GraphLayout | null {
  if (items.length === 0) return null;

  const firstTime = items[0]!.firstAt;
  const lastTime = items[items.length - 1]!.firstAt;
  const duration = Math.max(1000, lastTime - firstTime);

  const centerX = svgWidth * config.CENTER_X_RATIO;
  const positions = new Map<ParagraphId, Position>();

  let lastY = config.GRAPH_PADDING_TOP;
  items.forEach((item, i) => {
    const rawY =
      config.GRAPH_PADDING_TOP +
      ((item.firstAt - firstTime) / duration) * TIME_HEIGHT_PX;
    const y = Math.max(lastY + config.MIN_NODE_SEPARATION_Y, rawY);
    const x = centerX + (i % 2 === 0 ? -config.NODE_OFFSET_X : config.NODE_OFFSET_X);
    positions.set(item.id, { x, y, item });
    lastY = y;
  });

  const totalHeight = lastY + config.GRAPH_PADDING_BOTTOM;

  const minuteMarks: number[] = [];
  const firstMinute = Math.ceil(firstTime / MINUTE_MS) * MINUTE_MS;
  for (let t = firstMinute; t <= lastTime; t += MINUTE_MS) minuteMarks.push(t);

  return { positions, totalHeight, firstTime, lastTime, duration, minuteMarks };
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
      });
    }
  }
  items.sort((a, b) => a.firstAt - b.firstAt);
  return items;
}
