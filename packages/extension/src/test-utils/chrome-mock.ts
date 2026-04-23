/**
 * Minimal in-memory shim for `chrome.storage.local` + `storage.onChanged`,
 * installed on `globalThis` for tests. Mirrors the async Promise-based
 * API Chrome exposes in MV3 and fires `onChanged` listeners on
 * `set` / `remove` the same way the real runtime does.
 *
 * Not a full-fidelity Chrome mock — only what our storage adapter uses.
 */

type Listener = (
  changes: { [key: string]: chrome.storage.StorageChange },
  area: chrome.storage.AreaName,
) => void;

export interface ChromeMockState {
  store: Record<string, unknown>;
  listeners: Listener[];
}

export function installChromeStorageMock(): ChromeMockState {
  const state: ChromeMockState = { store: {}, listeners: [] };

  const emit = (changes: Record<string, chrome.storage.StorageChange>): void => {
    if (Object.keys(changes).length === 0) return;
    // Copy the listeners array · mirrors Chrome's guarantee that adding
    // or removing a listener inside a fired listener does not affect
    // the current dispatch pass.
    for (const l of [...state.listeners]) l(changes, 'local');
  };

  const chromeShim = {
    storage: {
      local: {
        get: async (
          key: string | string[] | Record<string, unknown>,
        ): Promise<Record<string, unknown>> => {
          const keys =
            typeof key === 'string'
              ? [key]
              : Array.isArray(key)
                ? key
                : Object.keys(key);
          const out: Record<string, unknown> = {};
          for (const k of keys) if (k in state.store) out[k] = state.store[k];
          return out;
        },
        set: async (items: Record<string, unknown>): Promise<void> => {
          const changes: Record<string, chrome.storage.StorageChange> = {};
          for (const [k, v] of Object.entries(items)) {
            changes[k] = { oldValue: state.store[k], newValue: v };
            state.store[k] = v;
          }
          emit(changes);
        },
        remove: async (keys: string | string[]): Promise<void> => {
          const arr = typeof keys === 'string' ? [keys] : keys;
          const changes: Record<string, chrome.storage.StorageChange> = {};
          for (const k of arr) {
            if (k in state.store) {
              changes[k] = { oldValue: state.store[k], newValue: undefined };
              delete state.store[k];
            }
          }
          emit(changes);
        },
      },
      onChanged: {
        addListener: (cb: Listener): void => {
          state.listeners.push(cb);
        },
        removeListener: (cb: Listener): void => {
          const i = state.listeners.indexOf(cb);
          if (i >= 0) state.listeners.splice(i, 1);
        },
      },
    },
  };

  (globalThis as unknown as { chrome: unknown }).chrome = chromeShim;
  return state;
}

export function uninstallChromeStorageMock(): void {
  delete (globalThis as unknown as { chrome?: unknown }).chrome;
}
