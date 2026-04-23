import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SerializedGraph } from '@myrkh/memory-graph';
import {
  clearGraph,
  onGraphChange,
  readGraph,
  SUPER_KEY,
  writeGraph,
} from './storage.js';
import {
  installChromeStorageMock,
  uninstallChromeStorageMock,
  type ChromeMockState,
} from '../test-utils/chrome-mock.js';

function emptyGraph(): SerializedGraph {
  return {
    version: 2,
    nodes: [],
    edges: [],
    passages: [],
    annotations: [],
    intensityBuckets: [],
  };
}

function sampleGraph(): SerializedGraph {
  return {
    version: 2,
    nodes: [
      [
        'p-1',
        { order: 0, firstAt: 1000, totalMs: 3500, visits: 1, pinned: false, extract: 'one' },
      ],
    ],
    edges: [],
    passages: [],
    annotations: [],
    intensityBuckets: [{ m: 1, s: 3.5 }],
  };
}

describe('extension storage adapter', () => {
  let mock: ChromeMockState;

  beforeEach(() => {
    mock = installChromeStorageMock();
  });

  afterEach(() => {
    uninstallChromeStorageMock();
  });

  it('readGraph returns null when no snapshot has been persisted', async () => {
    expect(await readGraph()).toBeNull();
  });

  it('writeGraph then readGraph round-trips the same payload', async () => {
    const graph = sampleGraph();
    await writeGraph(graph);
    expect(await readGraph()).toEqual(graph);
  });

  it('writeGraph replaces the previous snapshot atomically (not merges)', async () => {
    await writeGraph(sampleGraph());
    await writeGraph(emptyGraph());
    expect(await readGraph()).toEqual(emptyGraph());
  });

  it('clearGraph removes the snapshot so readGraph returns null again', async () => {
    await writeGraph(sampleGraph());
    await clearGraph();
    expect(await readGraph()).toBeNull();
  });

  it('onGraphChange fires with the new graph when a write happens in another context', async () => {
    const cb = vi.fn();
    const unsubscribe = onGraphChange(cb);
    const graph = sampleGraph();
    await writeGraph(graph);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(graph);
    unsubscribe();
  });

  it('onGraphChange fires with null when the snapshot is cleared', async () => {
    await writeGraph(sampleGraph());
    const cb = vi.fn();
    onGraphChange(cb);
    await clearGraph();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(null);
  });

  it('onGraphChange unsubscribe detaches the listener cleanly', async () => {
    const cb = vi.fn();
    const unsubscribe = onGraphChange(cb);
    unsubscribe();
    await writeGraph(sampleGraph());
    expect(cb).not.toHaveBeenCalled();
  });

  it('onGraphChange ignores changes to unrelated keys', async () => {
    const cb = vi.fn();
    onGraphChange(cb);
    // Write to a different key — listener should NOT fire for it.
    await chrome.storage.local.set({ 'mg:unrelated': { some: 'other' } });
    expect(cb).not.toHaveBeenCalled();
    // But writing to SUPER_KEY still fires.
    await writeGraph(sampleGraph());
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('SUPER_KEY is a stable, namespaced identifier (guards against rename-drift)', () => {
    expect(SUPER_KEY).toBe('mg:super');
    // If this breaks, it means someone renamed the key — which would
    // orphan every existing user's storage. Bump a migration, don't
    // just change the constant.
    expect(mock.store).toEqual({});
  });
});
