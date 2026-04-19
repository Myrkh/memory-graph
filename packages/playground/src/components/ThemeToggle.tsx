import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mg-playground:scheme';
type Scheme = 'light' | 'dark';

function readStoredScheme(): Scheme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function applyScheme(scheme: Scheme): void {
  const root = document.documentElement;
  if (scheme === 'dark') root.dataset['mgScheme'] = 'dark';
  else delete root.dataset['mgScheme'];
}

/**
 * Small floating pill at top-right that toggles the `data-mg-scheme` on
 * <html>. Persists to localStorage so a reload preserves the preference.
 * Playground-only — the library does not ship a theme switcher (Couche 3
 * decision belongs to the consumer site per the customization framework).
 */
export function ThemeToggle() {
  const [scheme, setScheme] = useState<Scheme>(readStoredScheme);

  useEffect(() => {
    applyScheme(scheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      /* quota / privacy mode */
    }
  }, [scheme]);

  const next: Scheme = scheme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="pg-theme-toggle"
      onClick={() => setScheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span aria-hidden>{scheme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
