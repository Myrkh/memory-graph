/**
 * Pluggable persistence abstraction — the lib doesn't know whether your
 * state lives in `localStorage`, `chrome.storage.local`, an IndexedDB
 * layer, or a POST to your API. It just calls `read`, `write`, and
 * `subscribe`. Every runtime (browser page, Chrome extension sidePanel,
 * Electron renderer, React-Native host…) provides its own adapter and
 * `<MemoryGraph.Root persistenceAdapter={…}>` picks it up.
 *
 * Contract :
 *   · `read()`       · returns the current persisted graph, or `null`.
 *   · `write(graph)` · replaces the persisted graph atomically.
 *   · `subscribe(cb)` · fires `cb` whenever a PEER context rewrites the
 *                       snapshot. The returned function detaches the
 *                       listener. The adapter may also fire for its OWN
 *                       writes (e.g. `chrome.storage.onChanged`) ; the
 *                       hook debounces those via a last-written ref.
 */

import type { SerializedGraph } from './types.js';

export interface PersistenceAdapter {
  read(): Promise<SerializedGraph | null>;
  write(graph: SerializedGraph): Promise<void>;
  subscribe(cb: (graph: SerializedGraph | null) => void): () => void;
}
