import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type MemoryGraphConfig } from '../types.js';
import { initialReducerState, reducer, type Action, type ReducerState } from './reducer.js';

const CONFIG: MemoryGraphConfig = { ...DEFAULT_CONFIG, DWELL_MS: 3000 };
const BASE_TS = 1_700_000_000_000;

function apply(state: ReducerState, action: Action): ReducerState {
  return reducer(state, action, CONFIG);
}

/**
 * Site dimension (v0.3.0) — one level above `route`. Symmetric birth-
 * immutable + legacy-backfill semantics.
 */
describe('reducer · site (v0.3.0)', () => {
  it('stamps `site` on a new station at first promotion', () => {
    const after = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'first station',
      now: BASE_TS,
      site: 'https://github.com',
    });

    expect(after.graph.nodes.get('p-1')?.site).toBe('https://github.com');
  });

  it('backfills `site` on re-commit when the existing node lacks one', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'legacy',
      now: BASE_TS,
    });
    expect(s.graph.nodes.get('p-1')?.site).toBeUndefined();

    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3100,
      textContent: 'legacy',
      now: BASE_TS + 10_000,
      site: 'https://notion.so',
    });
    expect(s.graph.nodes.get('p-1')?.site).toBe('https://notion.so');
  });

  it('preserves the original site on re-commit (birth-site is immutable)', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'first',
      now: BASE_TS,
      site: 'https://github.com',
    });

    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3200,
      textContent: 'first',
      now: BASE_TS + 30_000,
      site: 'https://notion.so',
    });

    expect(s.graph.nodes.get('p-1')?.site).toBe('https://github.com');
    expect(s.graph.nodes.get('p-1')?.visits).toBe(2);
  });

  it('stamps `site` on a newly-created passage (dwellMs < DWELL_MS)', () => {
    const after = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-passage',
      dwellMs: 800,
      textContent: 'quick glance',
      now: BASE_TS,
      site: 'https://github.com',
    });

    const passage = after.graph.passages.get('p-passage');
    expect(passage).toBeDefined();
    expect(passage?.site).toBe('https://github.com');
  });

  it('site and route are orthogonal — a commit can set both independently', () => {
    const after = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'first',
      now: BASE_TS,
      route: '/docs/intro',
      site: 'https://context7.com',
    });

    const node = after.graph.nodes.get('p-1');
    expect(node?.route).toBe('/docs/intro');
    expect(node?.site).toBe('https://context7.com');
  });
});
