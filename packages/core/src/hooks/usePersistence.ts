import { useCallback, useEffect, useRef } from 'react';
import { CURRENT_SCHEMA_VERSION, type GraphState, type SerializedGraph } from '../types.js';
import { parseStoredPayload } from '../internal/persistence-migration.js';

export interface ExportMeta {
  /** Absolute URL of the source document. Defaults to `window.location.href` when available. */
  url?: string;
  /** ISO-8601 timestamp. Defaults to `new Date().toISOString()` at call time. */
  capturedAt?: string;
}

export interface UsePersistenceReturn {
  /** Serialize the current graph into the richer JSON format used by the vanilla export button. */
  exportJson(meta?: ExportMeta): string;
  /** Remove the persisted snapshot from localStorage (does not touch the in-memory graph). */
  clearPersisted(): void;
}

function serialize(state: GraphState): SerializedGraph {
  return {
    version: CURRENT_SCHEMA_VERSION,
    nodes: [...state.nodes.entries()],
    edges: state.edges.slice(),
    passages: [...state.passages.entries()],
    annotations: [...state.annotations.values()],
    intensityBuckets: state.intensityBuckets.slice(),
  };
}

function readStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null;
  const anyGlobal = globalThis as { localStorage?: Storage };
  return anyGlobal.localStorage ?? null;
}

/**
 * Persists a graph to localStorage under `storageKey`, rehydrates it once
 * on mount, and **keeps tabs in sync** via the browser's native `storage`
 * event — any `setItem` on the same origin fires a `storage` event in
 * every OTHER tab, so we pick up peer writes and restore into the reducer.
 *
 * - Reads on mount: if a snapshot exists, calls `onRestore(data)`.
 * - Writes on every state change (after the initial mount read),
 *   skipping the write when localStorage already matches — breaks the
 *   intertab echo loop cleanly and avoids redundant serialization.
 * - On write failure (quota / privacy mode), calls `onPersistError` if
 *   provided so the consumer can surface a toast or downgrade a feature
 *   instead of failing silently.
 * - `showPassages` is intentionally NOT persisted, matching the vanilla reference.
 */
export function usePersistence(
  state: GraphState,
  storageKey: string,
  onRestore: (data: SerializedGraph) => void,
  onPersistError?: (err: Error) => void,
): UsePersistenceReturn {
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const onPersistErrorRef = useRef(onPersistError);
  onPersistErrorRef.current = onPersistError;

  const hasRestoredRef = useRef(false);

  // Initial mount restore --------------------------------------------------
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    const storage = readStorage();
    if (!storage) return;
    const raw = storage.getItem(storageKey);
    const parsed = parseStoredPayload(raw);
    if (parsed) onRestoreRef.current(parsed);
  }, [storageKey]);

  // Intertab sync · listen to peer writes on the same origin ---------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent): void => {
      if (e.key !== storageKey || !e.newValue) return;
      const parsed = parseStoredPayload(e.newValue);
      if (parsed) onRestoreRef.current(parsed);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  // Write on state change (guarded against redundant + echo writes) --------
  useEffect(() => {
    if (!hasRestoredRef.current) return;
    const storage = readStorage();
    if (!storage) return;
    try {
      const serialized = JSON.stringify(serialize(state));
      if (storage.getItem(storageKey) === serialized) return;
      storage.setItem(storageKey, serialized);
    } catch (err) {
      onPersistErrorRef.current?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }, [state, storageKey]);

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

  const clearPersisted = useCallback(() => {
    const storage = readStorage();
    if (!storage) return;
    try {
      storage.removeItem(storageKey);
    } catch (err) {
      onPersistErrorRef.current?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }, [storageKey]);

  return { exportJson, clearPersisted };
}
