import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type MemoryGraphConfig, type SerializedGraph } from '../types.js';
import {
  EXTRACT_LEN_PASSAGE,
  EXTRACT_LEN_STATION,
  initialReducerState,
  reducer,
  type Action,
  type ReducerState,
} from './reducer.js';

const CONFIG: MemoryGraphConfig = { ...DEFAULT_CONFIG, DWELL_MS: 3000 };
const BASE_TS = 1_700_000_000_000;

function apply(state: ReducerState, action: Action): ReducerState {
  return reducer(state, action, CONFIG);
}

describe('reducer · commit', () => {
  it('creates a passage when dwellMs is below the threshold', () => {
    const after = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 800,
      textContent: 'a short dwell that should not promote to a station',
      now: BASE_TS,
    });

    expect(after.graph.nodes.size).toBe(0);
    expect(after.graph.passages.size).toBe(1);

    const passage = after.graph.passages.get('p-1');
    expect(passage?.firstAt).toBe(BASE_TS);
    expect(passage?.extract.length).toBeLessThanOrEqual(EXTRACT_LEN_PASSAGE + 1);

    expect(after.previousStationId).toBeNull();
    expect(after.graph.intensityBuckets).toHaveLength(1);
    expect(after.graph.intensityBuckets[0]?.s).toBeCloseTo(0.8);
  });

  it('promotes to a station and emits a forward edge from the previous station', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3500,
      textContent: 'first station paragraph',
      now: BASE_TS,
    });
    s = apply(s, {
      type: 'commit',
      paraId: 'p-2',
      dwellMs: 4000,
      textContent: 'second station paragraph',
      now: BASE_TS + 60_000,
    });

    expect(s.graph.nodes.size).toBe(2);
    expect(s.previousStationId).toBe('p-2');
    expect(s.graph.edges).toHaveLength(1);
    expect(s.graph.edges[0]).toMatchObject({
      from: 'p-1',
      to: 'p-2',
      kind: 'forward',
    });

    const second = s.graph.nodes.get('p-2');
    expect(second?.order).toBe(1);
    expect(second?.totalMs).toBe(4000);
    expect(second?.visits).toBe(1);
    expect(second?.extract.length).toBeLessThanOrEqual(EXTRACT_LEN_STATION + 1);
  });

  it('records a return edge and accumulates dwell + visits on re-entry (only when dwell >= threshold)', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3200,
      textContent: 'intro',
      now: BASE_TS,
    });
    s = apply(s, {
      type: 'commit',
      paraId: 'p-2',
      dwellMs: 3400,
      textContent: 'second',
      now: BASE_TS + 10_000,
    });
    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3100,
      textContent: 'intro',
      now: BASE_TS + 20_000,
    });

    const p1 = s.graph.nodes.get('p-1');
    expect(p1?.totalMs).toBe(3200 + 3100);
    expect(p1?.visits).toBe(2);

    expect(s.graph.edges).toHaveLength(2);
    expect(s.graph.edges[1]).toMatchObject({
      from: 'p-2',
      to: 'p-1',
      kind: 'return',
      at: BASE_TS + 20_000,
    });
    expect(s.previousStationId).toBe('p-1');
  });

  it('short re-visit on an existing station is a passthrough — does not change visits or totalMs (vanilla fidelity)', () => {
    let s = apply(initialReducerState(), {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 3200,
      textContent: 'intro',
      now: BASE_TS,
    });
    const visitsBefore = s.graph.nodes.get('p-1')?.visits;
    const totalBefore = s.graph.nodes.get('p-1')?.totalMs;

    s = apply(s, {
      type: 'commit',
      paraId: 'p-1',
      dwellMs: 800,
      textContent: 'intro',
      now: BASE_TS + 5_000,
    });

    expect(s.graph.nodes.get('p-1')?.visits).toBe(visitsBefore);
    expect(s.graph.nodes.get('p-1')?.totalMs).toBe(totalBefore);
    expect(s.graph.passages.has('p-1')).toBe(false);
  });
});

describe('reducer · togglePin', () => {
  it('creates a pinned node with zero dwell when the paragraph is not yet a station', () => {
    const after = apply(initialReducerState(), {
      type: 'togglePin',
      paraId: 'p-1',
      textContent: 'pinned from a passage state',
      now: BASE_TS,
    });

    const node = after.graph.nodes.get('p-1');
    expect(node?.pinned).toBe(true);
    expect(node?.totalMs).toBe(0);
    expect(node?.visits).toBe(0);
    expect(node?.order).toBe(0);
    expect(node?.firstAt).toBe(BASE_TS);
  });
});

describe('reducer · restore', () => {
  it('rebuilds state and recomputes previousStationId from the highest-order node', () => {
    const payload: SerializedGraph = {
      version: 2,
      nodes: [
        ['p-a', { order: 0, firstAt: 1, totalMs: 5000, visits: 1, pinned: false, extract: 'a' }],
        ['p-b', { order: 2, firstAt: 3, totalMs: 8000, visits: 3, pinned: true, extract: 'b' }],
        ['p-c', { order: 1, firstAt: 2, totalMs: 4000, visits: 1, pinned: false, extract: 'c' }],
      ],
      edges: [
        { from: 'p-a', to: 'p-c', kind: 'forward', at: 10 },
        { from: 'p-c', to: 'p-b', kind: 'forward', at: 20 },
      ],
      passages: [['p-d', { firstAt: 99, extract: 'passage' }]],
      annotations: [],
      intensityBuckets: [{ m: 1, s: 12 }],
    };

    const after = apply(initialReducerState(), { type: 'restore', data: payload });

    expect(after.graph.nodes.size).toBe(3);
    expect(after.graph.edges).toHaveLength(2);
    expect(after.graph.passages.size).toBe(1);
    expect(after.previousStationId).toBe('p-b');
  });
});

describe('reducer · annotations', () => {
  const makeAnnotation = (id: string, links: string[] = []): import('../types.js').Annotation => ({
    id,
    paraId: 'p-a',
    selection: { text: 'matter', offsetStart: 10, offsetEnd: 16 },
    note: 'this matters',
    createdAt: BASE_TS,
    links,
  });

  it('addAnnotation inserts into the annotations map', () => {
    const after = apply(initialReducerState(), {
      type: 'addAnnotation',
      annotation: makeAnnotation('ann-1'),
    });
    expect(after.graph.annotations.size).toBe(1);
    expect(after.graph.annotations.get('ann-1')?.note).toBe('this matters');
  });

  it('removeAnnotation deletes and scrubs incoming links from other annotations', () => {
    let s = apply(initialReducerState(), {
      type: 'addAnnotation',
      annotation: makeAnnotation('ann-1'),
    });
    s = apply(s, {
      type: 'addAnnotation',
      annotation: makeAnnotation('ann-2', ['ann-1']),
    });

    s = apply(s, { type: 'removeAnnotation', id: 'ann-1' });

    expect(s.graph.annotations.has('ann-1')).toBe(false);
    expect(s.graph.annotations.get('ann-2')?.links).toEqual([]);
  });

  it('updateAnnotation replaces the note without touching the selection', () => {
    const original = makeAnnotation('ann-1');
    let s = apply(initialReducerState(), { type: 'addAnnotation', annotation: original });
    s = apply(s, { type: 'updateAnnotation', id: 'ann-1', patch: { note: 'edited' } });

    const ann = s.graph.annotations.get('ann-1');
    expect(ann?.note).toBe('edited');
    expect(ann?.selection).toEqual(original.selection);
  });

  it('addAnnotationLink is bidirectional and idempotent', () => {
    let s = apply(initialReducerState(), { type: 'addAnnotation', annotation: makeAnnotation('ann-1') });
    s = apply(s, { type: 'addAnnotation', annotation: makeAnnotation('ann-2') });

    s = apply(s, { type: 'addAnnotationLink', from: 'ann-1', to: 'ann-2' });
    expect(s.graph.annotations.get('ann-1')?.links).toEqual(['ann-2']);
    expect(s.graph.annotations.get('ann-2')?.links).toEqual(['ann-1']);

    // Same link twice → no duplicate.
    s = apply(s, { type: 'addAnnotationLink', from: 'ann-1', to: 'ann-2' });
    expect(s.graph.annotations.get('ann-1')?.links).toEqual(['ann-2']);
    expect(s.graph.annotations.get('ann-2')?.links).toEqual(['ann-1']);
  });

  it('removeAnnotationLink strips the link from both sides', () => {
    let s = apply(initialReducerState(), { type: 'addAnnotation', annotation: makeAnnotation('ann-1') });
    s = apply(s, { type: 'addAnnotation', annotation: makeAnnotation('ann-2') });
    s = apply(s, { type: 'addAnnotationLink', from: 'ann-1', to: 'ann-2' });

    s = apply(s, { type: 'removeAnnotationLink', from: 'ann-1', to: 'ann-2' });
    expect(s.graph.annotations.get('ann-1')?.links).toEqual([]);
    expect(s.graph.annotations.get('ann-2')?.links).toEqual([]);
  });

  it('addAnnotationWithLink creates a new annotation linked both ways to the target', () => {
    let s = apply(initialReducerState(), { type: 'addAnnotation', annotation: makeAnnotation('ann-A') });
    const newAnn = makeAnnotation('ann-B');

    s = apply(s, { type: 'addAnnotationWithLink', annotation: newAnn, linkTo: 'ann-A' });

    expect(s.graph.annotations.size).toBe(2);
    expect(s.graph.annotations.get('ann-B')?.links).toEqual(['ann-A']);
    expect(s.graph.annotations.get('ann-A')?.links).toEqual(['ann-B']);
  });
});

