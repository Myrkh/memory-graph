import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type GraphItem, type MemoryGraphConfig } from '../types.js';
import { layoutGraph } from './graph-layout.js';

const CONFIG: MemoryGraphConfig = DEFAULT_CONFIG;
const SVG_WIDTH = 400;

function station(id: string, firstAt: number, route?: string): GraphItem {
  return {
    id,
    type: 'station',
    order: 0,
    firstAt,
    totalMs: 3500,
    visits: 1,
    pinned: false,
    extract: id,
    ...(route !== undefined ? { route } : {}),
  };
}

describe('layoutGraph · single-column mode', () => {
  it('returns null for an empty items list', () => {
    expect(layoutGraph([], SVG_WIDTH, CONFIG)).toBeNull();
  });

  it('does NOT activate multi-column when no node has a route', () => {
    const layout = layoutGraph(
      [station('p-1', 100), station('p-2', 200), station('p-3', 300)],
      SVG_WIDTH,
      CONFIG,
    );

    expect(layout?.columns).toBeUndefined();
    expect(layout?.totalWidth).toBe(SVG_WIDTH);
  });

  it('does NOT activate multi-column with a single unique route (backward-compatible)', () => {
    const layout = layoutGraph(
      [station('p-1', 100, '/home'), station('p-2', 200, '/home')],
      SVG_WIDTH,
      CONFIG,
    );

    expect(layout?.columns).toBeUndefined();
  });
});

describe('layoutGraph · multi-column mode (v0.2.0)', () => {
  it('activates multi-column when ≥ 2 unique routes are present', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/home'),
        station('p-2', 200, '/demo'),
      ],
      SVG_WIDTH,
      CONFIG,
    );

    expect(layout?.columns).toBeDefined();
    expect(layout?.columns).toHaveLength(2);
  });

  it('orders columns chronologically by firstSeenAt (not alphabetically)', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/zebra'),
        station('p-2', 200, '/apple'),
        station('p-3', 300, '/mango'),
      ],
      SVG_WIDTH,
      CONFIG,
    );

    expect(layout?.columns?.map((c) => c.route)).toEqual(['/zebra', '/apple', '/mango']);
    expect(layout?.columns?.map((c) => c.index)).toEqual([0, 1, 2]);
  });

  it('expands totalWidth beyond svgWidth when multi-column activates (enables horizontal scroll)', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/a'),
        station('p-2', 200, '/b'),
        station('p-3', 300, '/c'),
      ],
      SVG_WIDTH,
      CONFIG,
    );

    expect(layout?.totalWidth).toBeGreaterThanOrEqual(SVG_WIDTH);
    // With 3 columns × COLUMN_MIN_WIDTH (200), totalWidth should be at least 600.
    expect(layout?.totalWidth).toBeGreaterThanOrEqual(600);
  });

  it('anchors each node near its route column centerX (within NODE_OFFSET_X zigzag)', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/home'),
        station('p-2', 200, '/demo'),
        station('p-3', 300, '/home'),
      ],
      SVG_WIDTH,
      CONFIG,
    );

    const homeCol = layout?.columns?.find((c) => c.route === '/home');
    const demoCol = layout?.columns?.find((c) => c.route === '/demo');
    const offset = CONFIG.NODE_OFFSET_X;

    // Nodes zigzag ±NODE_OFFSET_X around the column center.
    const x1 = layout?.positions.get('p-1')?.x ?? 0;
    const x2 = layout?.positions.get('p-2')?.x ?? 0;
    const x3 = layout?.positions.get('p-3')?.x ?? 0;
    expect(Math.abs(x1 - (homeCol?.centerX ?? 0))).toBe(offset);
    expect(Math.abs(x2 - (demoCol?.centerX ?? 0))).toBe(offset);
    expect(Math.abs(x3 - (homeCol?.centerX ?? 0))).toBe(offset);
  });

  it('preserves law 3 (Y = firstAt-driven) in multi-column mode', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/home'),
        station('p-2', 200, '/demo'),
      ],
      SVG_WIDTH,
      CONFIG,
    );

    const y1 = layout?.positions.get('p-1')?.y ?? 0;
    const y2 = layout?.positions.get('p-2')?.y ?? 0;
    expect(y2).toBeGreaterThan(y1);
  });
});
