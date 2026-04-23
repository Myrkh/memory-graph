import { useEffect, useState } from 'react';

/**
 * Tracks the active Chrome tab's `{ origin, pathname }` and streams
 * updates whenever the user switches tab OR navigates within the same
 * tab. The pathname feeds `<Root route>` so the Graph can light up the
 * matching 2D column in coral — mirroring what the playground does on
 * `location.pathname`.
 *
 * Subscribes to :
 *   - `chrome.tabs.onActivated` — user flips to another tab.
 *   - `chrome.tabs.onUpdated` — same tab navigates (full page or SPA
 *     `history.pushState`, which Chrome surfaces as a URL change event).
 *   - `chrome.windows.onFocusChanged` — user focuses another window.
 *
 * Non-http tabs (chrome://, about:, devtools://) resolve to `null` so
 * `<Root>` falls back to undefined `route` and no column highlights.
 */
export interface ActiveTabRoute {
  origin: string | null;
  pathname: string | null;
}

const EMPTY: ActiveTabRoute = { origin: null, pathname: null };

function toRoute(url: string | undefined): ActiveTabRoute {
  if (!url) return EMPTY;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return EMPTY;
    }
    return { origin: parsed.origin, pathname: parsed.pathname };
  } catch {
    return EMPTY;
  }
}

async function readActive(): Promise<ActiveTabRoute> {
  if (!chrome.tabs?.query) return EMPTY;
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return toRoute(tab?.url);
}

export function useActiveTabRoute(): ActiveTabRoute {
  const [route, setRoute] = useState<ActiveTabRoute>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    const refresh = (): void => {
      void readActive().then((next) => {
        if (!cancelled) setRoute(next);
      });
    };

    refresh();

    const onActivated = (): void => refresh();
    const onUpdated = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab,
    ): void => {
      if (!tab.active) return;
      if (changeInfo.url || changeInfo.status === 'complete') refresh();
    };
    const onFocus = (): void => refresh();

    chrome.tabs?.onActivated.addListener(onActivated);
    chrome.tabs?.onUpdated.addListener(onUpdated);
    chrome.windows?.onFocusChanged.addListener(onFocus);

    return () => {
      cancelled = true;
      chrome.tabs?.onActivated.removeListener(onActivated);
      chrome.tabs?.onUpdated.removeListener(onUpdated);
      chrome.windows?.onFocusChanged.removeListener(onFocus);
    };
  }, []);

  return route;
}
