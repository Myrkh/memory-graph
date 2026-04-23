import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, isThemeId, type ThemeId } from './theme-catalog.js';

/**
 * Persisted theme preference, shared by the sidepanel AND the
 * content-script React apps. Backed by `chrome.storage.sync` so the
 * choice follows the user across devices signed into the same Chrome
 * profile.
 *
 * Both runtimes subscribe to `chrome.storage.onChanged` — when the user
 * picks a new theme in the sidepanel's ThemeShop, the content-script's
 * floating UI (Tooltip, SelectionToolbar, …) re-themes within a frame.
 * Zero message passing : storage IS the channel.
 */

const STORAGE_KEY = 'mg-ext:theme';

export function useThemePreference(): readonly [ThemeId, (next: ThemeId) => void] {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    if (!chrome.storage?.sync) return;

    let cancelled = false;
    chrome.storage.sync.get([STORAGE_KEY]).then((result) => {
      if (cancelled) return;
      const stored = result[STORAGE_KEY];
      if (isThemeId(stored)) setTheme(stored);
    });

    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ): void => {
      if (areaName !== 'sync') return;
      const next = changes[STORAGE_KEY]?.newValue;
      if (isThemeId(next)) setTheme(next);
    };
    chrome.storage.onChanged.addListener(onChanged);

    return () => {
      cancelled = true;
      chrome.storage.onChanged.removeListener(onChanged);
    };
  }, []);

  const commit = useCallback((next: ThemeId) => {
    setTheme(next);
    chrome.storage?.sync.set({ [STORAGE_KEY]: next });
  }, []);

  return [theme, commit] as const;
}
