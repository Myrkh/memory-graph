import { useSyncExternalStore } from 'react';

type HistoryFn = typeof history.pushState;

/**
 * React hook returning the live `window.location.pathname`. Captures
 * route changes through four layered signals so the content-script's
 * `<Root route>` stays correct on every framework in the wild :
 *
 *   1. `window.navigation` `'navigate'` event (Chrome 102+) — the
 *      cleanest, framework-agnostic signal. Fires for Next.js App
 *      Router, React Router v6+, Astro view transitions, direct
 *      `history.pushState`, back/forward, and anchor clicks alike.
 *   2. `history.pushState` / `replaceState` monkey-patch — fallback
 *      when the Navigation API is disabled (Chrome flags) or for
 *      edge cases where a router bypasses it.
 *   3. `popstate` + `hashchange` — the classic browser-history signals.
 *   4. `requestAnimationFrame` URL poll — final safety net for apps
 *      that rewrite pathname via non-standard means (zustand-backed
 *      state, manual `document.location` assignments, service workers
 *      that intercept navigation). Cheap : one string equality check
 *      per frame, only when subscribers exist.
 *
 * The store is shared globally via `globalThis.__mgPathnameStore` so
 * multiple consumers of the hook don't each install their own patches.
 */

type Listener = () => void;

interface PathnameStore {
  subscribers: Set<Listener>;
  pushPatched: boolean;
  pollingFrame: number | null;
  lastPathname: string;
}

function getStore(): PathnameStore {
  const g = globalThis as unknown as { __mgPathnameStore?: PathnameStore };
  if (!g.__mgPathnameStore) {
    g.__mgPathnameStore = {
      subscribers: new Set(),
      pushPatched: false,
      pollingFrame: null,
      lastPathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    };
  }
  return g.__mgPathnameStore;
}

function notifyAll(store: PathnameStore): void {
  for (const cb of store.subscribers) cb();
}

function ensurePatched(store: PathnameStore): void {
  if (store.pushPatched) return;
  store.pushPatched = true;

  const originalPush: HistoryFn = history.pushState.bind(history);
  const originalReplace: HistoryFn = history.replaceState.bind(history);

  history.pushState = function patched(...args) {
    originalPush(...(args as Parameters<HistoryFn>));
    notifyAll(store);
  };
  history.replaceState = function patched(...args) {
    originalReplace(...(args as Parameters<HistoryFn>));
    notifyAll(store);
  };

  window.addEventListener('popstate', () => notifyAll(store));
  window.addEventListener('hashchange', () => notifyAll(store));

  // Navigation API — the cleanest, framework-agnostic signal.
  const nav = (window as unknown as {
    navigation?: EventTarget;
  }).navigation;
  nav?.addEventListener('navigate', () => notifyAll(store));
}

function startPolling(store: PathnameStore): void {
  if (store.pollingFrame !== null) return;
  const tick = (): void => {
    const next = window.location.pathname;
    if (next !== store.lastPathname) {
      store.lastPathname = next;
      notifyAll(store);
    }
    store.pollingFrame =
      store.subscribers.size > 0 ? requestAnimationFrame(tick) : null;
  };
  store.pollingFrame = requestAnimationFrame(tick);
}

function subscribe(listener: Listener): () => void {
  const store = getStore();
  ensurePatched(store);
  store.subscribers.add(listener);
  startPolling(store);
  return () => {
    store.subscribers.delete(listener);
    // Polling self-stops at the next tick when no subscribers remain.
  };
}

function getSnapshot(): string {
  return window.location.pathname;
}

export function useCurrentPathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
