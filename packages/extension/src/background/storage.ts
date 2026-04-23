/**
 * `chrome.storage.local` adapter · typed façade for the unified super-
 * state. Callable from ANY extension context (worker, side panel,
 * content script) — Chrome synchronizes `storage.local` across them
 * natively and fires `onChanged` in every listening context.
 *
 * Contract :
 *   · `readGraph` returns the persisted snapshot, or `null` when none
 *     exists yet (first run, just after clear).
 *   · `writeGraph` replaces the entire snapshot atomically.
 *   · `onGraphChange` subscribes to cross-context updates. Returns a
 *     cleanup function that detaches the listener.
 *   · `clearGraph` removes the snapshot — the next `readGraph` returns
 *     `null`. Fires `onGraphChange` listeners with `null`.
 *
 * No in-memory cache — every call hits `chrome.storage`. Chrome already
 * caches this internally ; adding another layer only invites staleness.
 */

import type { SerializedGraph } from '@myrkh/memory-graph';

/** Single storage key for the unified super-state. */
export const SUPER_KEY = 'mg:super';

export async function readGraph(): Promise<SerializedGraph | null> {
  const result = await chrome.storage.local.get(SUPER_KEY);
  const value = result[SUPER_KEY];
  return (value as SerializedGraph | undefined) ?? null;
}

export async function writeGraph(graph: SerializedGraph): Promise<void> {
  await chrome.storage.local.set({ [SUPER_KEY]: graph });
}

export async function clearGraph(): Promise<void> {
  await chrome.storage.local.remove(SUPER_KEY);
}

/**
 * Subscribe to cross-context updates on the super-state. The callback
 * fires with the new graph (or `null` if cleared) whenever any context
 * writes to `SUPER_KEY`, including the calling context — consumers that
 * want to skip their own writes must debounce via a write-id or ref.
 */
export function onGraphChange(
  cb: (graph: SerializedGraph | null) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: chrome.storage.AreaName,
  ): void => {
    if (area !== 'local') return;
    const change = changes[SUPER_KEY];
    if (!change) return;
    cb((change.newValue as SerializedGraph | undefined) ?? null);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
