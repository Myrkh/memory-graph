import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type GraphState, type SerializedGraph } from '../types.js';
import { serializeGraph } from '../internal/serialize.js';
import { createLocalStorageAdapter } from '../internal/local-storage-adapter.js';
import type { PersistenceAdapter } from '../persistence-adapter.js';

export interface ExportMeta {
  /** Absolute URL of the source document. Defaults to `window.location.href` when available. */
  url?: string;
  /** ISO-8601 timestamp. Defaults to `new Date().toISOString()` at call time. */
  capturedAt?: string;
}

export interface UsePersistenceReturn {
  /** Serialize the current graph into the richer JSON format used by the vanilla export button. */
  exportJson(meta?: ExportMeta): string;
  /** Remove the persisted snapshot (does not touch the in-memory graph). */
  clearPersisted(): Promise<void>;
}

/**
 * Persists a graph via a pluggable `PersistenceAdapter`. Default
 * behaviour (backward-compatible with v0.2) : wrap `storageKey` in a
 * `localStorage` adapter. Consumers can override with `adapter` to
 * target `chrome.storage.local`, a custom sync engine, etc. — the lib
 * stays runtime-agnostic.
 *
 * Lifecycle :
 *   · mount · `adapter.read()` → `onRestore(data)` if present
 *   · state change · serialize + compare with last-persisted ref →
 *     `adapter.write(graph)` when changed
 *   · external peer writes · `adapter.subscribe` → `onRestore(data)`,
 *     but skips the callback when the incoming payload equals our own
 *     last write (echo guard)
 *
 * `onPersistError` receives any error thrown by the adapter's
 * async methods — consumers can surface a toast instead of losing
 * state silently.
 */
export function usePersistence(
  state: GraphState,
  storageKey: string,
  onRestore: (data: SerializedGraph) => void,
  onPersistError?: (err: Error) => void,
  adapter?: PersistenceAdapter,
): UsePersistenceReturn {
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const onPersistErrorRef = useRef(onPersistError);
  onPersistErrorRef.current = onPersistError;

  // Stable adapter reference · default to localStorage keyed by storageKey.
  const effectiveAdapter = useMemo<PersistenceAdapter>(
    () => adapter ?? createLocalStorageAdapter(storageKey),
    [adapter, storageKey],
  );
  const adapterRef = useRef(effectiveAdapter);
  adapterRef.current = effectiveAdapter;

  const hasRestoredRef = useRef(false);
  /** Last payload we either wrote OR received — used to skip echo writes
   * and echo restores. `null` means "we haven't sync'd yet". */
  const lastPersistedRef = useRef<string | null>(null);

  const dispatchError = useCallback((err: unknown) => {
    const e = err instanceof Error ? err : new Error(String(err));
    onPersistErrorRef.current?.(e);
  }, []);

  // Initial mount restore ------------------------------------------------
  // Critical : `hasRestoredRef` must only flip AFTER the async read
  // resolves. Otherwise the write effect below sees a truthy flag on
  // mount, serializes the EMPTY `initialReducerState`, and clobbers
  // whatever the peer context previously persisted — the classic
  // "fresh mount wipes the shared storage" bug.
  useEffect(() => {
    if (hasRestoredRef.current) return;
    let cancelled = false;
    adapterRef.current
      .read()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          lastPersistedRef.current = JSON.stringify(data);
          onRestoreRef.current(data);
        }
        hasRestoredRef.current = true;
      })
      .catch((err) => {
        if (cancelled) return;
        dispatchError(err);
        // Unblock writes on error · the consumer will see their own
        // data persist even if the first read crashed.
        hasRestoredRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [dispatchError]);

  // Subscribe to peer writes --------------------------------------------
  useEffect(() => {
    const unsubscribe = effectiveAdapter.subscribe((data) => {
      if (!data) {
        lastPersistedRef.current = null;
        return;
      }
      const str = JSON.stringify(data);
      if (str === lastPersistedRef.current) return; // our own echo
      lastPersistedRef.current = str;
      onRestoreRef.current(data);
    });
    return unsubscribe;
  }, [effectiveAdapter]);

  // Write on state change (guarded) -------------------------------------
  useEffect(() => {
    if (!hasRestoredRef.current) return;
    const serialized = serializeGraph(state);
    const str = JSON.stringify(serialized);
    if (str === lastPersistedRef.current) return; // no change vs last sync
    lastPersistedRef.current = str;
    adapterRef.current.write(serialized).catch(dispatchError);
  }, [state, dispatchError]);

  const exportJson = useCallback(
    (meta?: ExportMeta): string => {
      const nodes = [...state.nodes.entries()].map(([id, v]) => ({ id, ...v }));
      const passages = [...state.passages.entries()].map(([id, v]) => ({ id, ...v }));
      const annotations = [...state.annotations.values()];
      let totalReadMs = 0;
      let pinCount = 0;
      for (const v of state.nodes.values()) {
        totalReadMs += v.totalMs;
        if (v.pinned) pinCount++;
      }
      let loopCount = 0;
      for (const e of state.edges) if (e.kind === 'return') loopCount++;

      const defaultUrl =
        typeof globalThis !== 'undefined' &&
        (globalThis as { location?: Location }).location?.href
          ? (globalThis as { location: Location }).location.href
          : '';

      const payload = {
        url: meta?.url ?? defaultUrl,
        capturedAt: meta?.capturedAt ?? new Date().toISOString(),
        nodes,
        edges: state.edges,
        passages,
        annotations,
        metrics: {
          nodeCount: state.nodes.size,
          loopCount,
          totalReadMs,
          pinCount,
          annotationCount: annotations.length,
        },
      };
      return JSON.stringify(payload, null, 2);
    },
    [state],
  );

  const clearPersisted = useCallback(async () => {
    try {
      lastPersistedRef.current = null;
      // "Empty" graph write ; the adapter decides whether to delete or
      // store an empty snapshot — the behaviour is equivalent for the
      // reducer since both hydrate into an empty GraphState.
      await adapterRef.current.write({
        version: 2,
        nodes: [],
        edges: [],
        passages: [],
        annotations: [],
        intensityBuckets: [],
      });
    } catch (err) {
      dispatchError(err);
    }
  }, [dispatchError]);

  return { exportJson, clearPersisted };
}
