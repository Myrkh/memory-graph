import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type GraphItem, type MemoryGraphConfig } from '../types.js';
import { layoutGraph } from './graph-layout.js';

const CONFIG: MemoryGraphConfig = DEFAULT_CONFIG;
const SVG_WIDTH = 400;

function station(
  id: string,
  firstAt: number,
  route?: string,
  site?: string,
): GraphItem {
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
    ...(site !== undefined ? { site } : {}),
  };
}

function passage(id: string, firstAt: number, site?: string): GraphItem {
  return {
    id,
    type: 'passage',
    firstAt,
    extract: id,
    totalMs: 0,
    visits: 0,
    pinned: false,
    order: -1,
    ...(site !== undefined ? { site } : {}),
  };
}

describe('layoutGraph · site filter (v0.3.0)', () => {
  it('includes every item when `site` is undefined (backward compat)', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/a', 'site-a'),
        station('p-2', 200, '/b', 'site-b'),
      ],
      SVG_WIDTH,
      CONFIG,
    );
    expect(layout?.positions.size).toBe(2);
  });

  it('filters to stations matching the given site only', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/a', 'site-a'),
        station('p-2', 200, '/b', 'site-b'),
        station('p-3', 300, '/c', 'site-a'),
      ],
      SVG_WIDTH,
      CONFIG,
      { site: 'site-a' },
    );
    expect(layout?.positions.size).toBe(2);
    expect(layout?.positions.has('p-1')).toBe(true);
    expect(layout?.positions.has('p-3')).toBe(true);
    expect(layout?.positions.has('p-2')).toBe(false);
  });

  it('returns null when no items match the site filter', () => {
    const layout = layoutGraph(
      [station('p-1', 100, '/a', 'site-a')],
      SVG_WIDTH,
      CONFIG,
      { site: 'unknown-site' },
    );
    expect(layout).toBeNull();
  });

  it('includes passages with matching site in per-site filter', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/a', 'site-a'),
        passage('p-2', 200, 'site-a'),
        passage('p-3', 300, 'site-b'),
      ],
      SVG_WIDTH,
      CONFIG,
      { site: 'site-a' },
    );
    expect(layout?.positions.size).toBe(2);
    expect(layout?.positions.has('p-1')).toBe(true);
    expect(layout?.positions.has('p-2')).toBe(true);
    expect(layout?.positions.has('p-3')).toBe(false);
  });

  it('excludes legacy passages without site when filtering', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/a', 'site-a'),
        passage('p-legacy', 200), // no site — pre-v0.3.0
      ],
      SVG_WIDTH,
      CONFIG,
      { site: 'site-a' },
    );
    expect(layout?.positions.size).toBe(1);
    expect(layout?.positions.has('p-legacy')).toBe(false);
  });

  it('combines site filter with multi-column route layout', () => {
    const layout = layoutGraph(
      [
        station('p-1', 100, '/home', 'site-a'),
        station('p-2', 200, '/docs', 'site-a'),
        station('p-3', 300, '/home', 'site-b'),
      ],
      SVG_WIDTH,
      CONFIG,
      { site: 'site-a' },
    );
    // Only site-a stations remain → 2 unique routes → multi-column activates.
    expect(layout?.columns).toBeDefined();
    expect(layout?.columns?.map((c) => c.route).sort()).toEqual(['/docs', '/home']);
  });
});
