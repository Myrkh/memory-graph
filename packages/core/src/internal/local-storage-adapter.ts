/**
 * Default `PersistenceAdapter` backed by `localStorage`. Mirrors the
 * behaviour of the legacy `usePersistence` hook — same storage key,
 * same JSON format, same `storage` event bridging across tabs of the
 * same origin. Used automatically when `<MemoryGraph.Root>` is mounted
 * without an explicit `persistenceAdapter` prop, so existing consumers
 * upgrade without any code change.
 */

import { parseStoredPayload } from './persistence-migration.js';
import type { PersistenceAdapter } from '../persistence-adapter.js';
import type { SerializedGraph } from '../types.js';

function readLocalStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as { localStorage?: Storage };
  return g.localStorage ?? null;
}

export function createLocalStorageAdapter(storageKey: string): PersistenceAdapter {
  return {
    async read(): Promise<SerializedGraph | null> {
      const ls = readLocalStorage();
      if (!ls) return null;
      const raw = ls.getItem(storageKey);
      return parseStoredPayload(raw);
    },

    async write(graph: SerializedGraph): Promise<void> {
      const ls = readLocalStorage();
      if (!ls) return;
      ls.setItem(storageKey, JSON.stringify(graph));
    },

    subscribe(cb: (graph: SerializedGraph | null) => void): () => void {
      if (typeof window === 'undefined') return () => {};
      const onStorage = (e: StorageEvent): void => {
        if (e.key !== storageKey) return;
        cb(e.newValue ? parseStoredPayload(e.newValue) : null);
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    },
  };
}
