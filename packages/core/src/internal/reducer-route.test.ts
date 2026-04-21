import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type MemoryGraphConfig } from '../types.js';
import { initialReducerState, reducer, type Action, type ReducerState } from './reducer.js';

const CONFIG: MemoryGraphConfig = { ...DEFAULT_CONFIG, DWELL_MS: 3000 };
const BASE_TS = 1_700_000_000_000;

function apply(state: ReducerState, action: Action): ReducerState {
  return reducer(state, action, CONFIG);
}

/**
 * Route dimension (v0.2.0) — birth-route semantics. A node's `route` is
 * stamped at first promotion and stays immutable afterwards; legacy nodes
 * without a route get backfilled opportunistically on re-commit.
 */
describe('reducer · route (v0.2.0)', () => {
  it('stamps `route` onto a new station at first promotion', () => {
    const after = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'first station on /home',
      now: BASE_TS,
      route: '/home',
    });

    expect(after.graph.nodes.get('p-1')?.route).toBe('/home');
  });

  it('backfills `route` on re-commit when the existing node lacks one', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'legacy',
      now: BASE_TS,
    });
    expect(s.graph.nodes.get('p-1')?.route).toBeUndefined();

    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3100,
      textContent: 'legacy',
      now: BASE_TS + 10_000,
      route: '/demo',
    });
    expect(s.graph.nodes.get('p-1')?.route).toBe('/demo');
  });

  it('preserves the original route on re-commit (birth-route is immutable)', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'born on /home',
      now: BASE_TS,
      route: '/home',
    });

    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3200,
      textContent: 'same paragraph re-visited from /demo',
      now: BASE_TS + 30_000,
      route: '/demo',
    });

    expect(s.graph.nodes.get('p-1')?.route).toBe('/home');
    expect(s.graph.nodes.get('p-1')?.visits).toBe(2);
  });
});
