/**
 * `PersistenceAdapter` backed by `chrome.storage.local`. Shared by every
 * runtime inside the extension — side panel, content-script React app,
 * service worker — so `<MemoryGraph.Root persistenceAdapter={…}>` keeps
 * one source of truth across all contexts.
 *
 * Relies on `background/storage.ts` for the actual `chrome.storage`
 * calls, which keeps the `SUPER_KEY` constant + `SerializedGraph`
 * validation in one place.
 */

import type { PersistenceAdapter, SerializedGraph } from '@myrkh/memory-graph';
import { onGraphChange, readGraph, writeGraph } from '../background/storage.js';

export function createChromeStorageAdapter(): PersistenceAdapter {
  return {
    read(): Promise<SerializedGraph | null> {
      return readGraph();
    },
    write(graph: SerializedGraph): Promise<void> {
      return writeGraph(graph);
    },
    subscribe(cb: (graph: SerializedGraph | null) => void): () => void {
      return onGraphChange(cb);
    },
  };
}
