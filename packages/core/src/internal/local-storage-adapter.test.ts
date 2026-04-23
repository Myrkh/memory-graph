import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageAdapter } from './local-storage-adapter.js';
import type { SerializedGraph } from '../types.js';

function sample(): SerializedGraph {
  return {
    version: 2,
    nodes: [
      [
        'p-1',
        { order: 0, firstAt: 1000, totalMs: 3500, visits: 1, pinned: false, extract: 'hi' },
      ],
    ],
    edges: [],
    passages: [],
    annotations: [],
    intensityBuckets: [],
  };
}

/**
 * Minimal in-memory `Storage` + `StorageEvent` shim. `storage` events
 * must NOT fire in the tab that wrote (same-tab policy) — this mirrors
 * real browser behaviour so the adapter can't accidentally rely on
 * self-notification.
 */
function installLocalStorageShim() {
  const store = new Map<string, string>();
  let listeners: Array<(e: StorageEvent) => void> = [];

  const localStorage: Storage = {
    get length() {
      return store.size;
    },
    key: (i) => [...store.keys()][i] ?? null,
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };

  (globalThis as unknown as { localStorage: Storage }).localStorage = localStorage;

  const win = {
    addEventListener: (type: string, cb: (e: StorageEvent) => void) => {
      if (type === 'storage') listeners.push(cb);
    },
    removeEventListener: (type: string, cb: (e: StorageEvent) => void) => {
      if (type === 'storage') listeners = listeners.filter((l) => l !== cb);
    },
  };
  (globalThis as unknown as { window: unknown }).window = win;

  const peerWrite = (key: string, value: string | null): void => {
    const e = { key, newValue: value, oldValue: store.get(key) ?? null } as StorageEvent;
    if (value === null) store.delete(key);
    else store.set(key, value);
    for (const l of [...listeners]) l(e);
  };

  return { peerWrite, listenerCount: () => listeners.length };
}

describe('createLocalStorageAdapter', () => {
  let mock: ReturnType<typeof installLocalStorageShim>;

  beforeEach(() => {
    mock = installLocalStorageShim();
  });

  afterEach(() => {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('read() returns null when nothing is persisted', async () => {
    const a = createLocalStorageAdapter('mg:test');
    expect(await a.read()).toBeNull();
  });

  it('write() then read() round-trips the payload', async () => {
    const a = createLocalStorageAdapter('mg:test');
    const graph = sample();
    await a.write(graph);
    expect(await a.read()).toEqual(graph);
  });

  it('subscribe() fires on peer writes (storage event)', async () => {
    const a = createLocalStorageAdapter('mg:test');
    let seen: SerializedGraph | null | undefined;
    const unsub = a.subscribe((g) => {
      seen = g;
    });

    const graph = sample();
    mock.peerWrite('mg:test', JSON.stringify(graph));
    expect(seen).toEqual(graph);

    unsub();
    expect(mock.listenerCount()).toBe(0);
  });

  it('subscribe() fires with null when a peer clears the key', () => {
    const a = createLocalStorageAdapter('mg:test');
    let seen: SerializedGraph | null | undefined = undefined;
    a.subscribe((g) => {
      seen = g;
    });
    mock.peerWrite('mg:test', null);
    expect(seen).toBeNull();
  });

  it('subscribe() ignores writes to unrelated keys', () => {
    const a = createLocalStorageAdapter('mg:test');
    let fired = false;
    a.subscribe(() => {
      fired = true;
    });
    mock.peerWrite('mg:other', JSON.stringify(sample()));
    expect(fired).toBe(false);
  });
});
