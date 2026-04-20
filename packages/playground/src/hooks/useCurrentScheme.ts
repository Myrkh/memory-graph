import { useEffect, useState } from 'react';

type Scheme = 'light' | 'dark';

function read(): Scheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset['mgScheme'] === 'dark' ? 'dark' : 'light';
}

/**
 * Subscribe to the `data-mg-scheme` attribute on `<html>`, updated by
 * `<ThemeToggle>`. Used by `<ThemeToggleNode>` so the node rendering in
 * the graph reflects the current theme in real time — click the toggle,
 * watch the node morph from sun (light) to crescent (dark).
 */
export function useCurrentScheme(): Scheme {
  const [scheme, setScheme] = useState<Scheme>(read);

  useEffect(() => {
    const html = document.documentElement;
    const update = (): void => setScheme(read());
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ['data-mg-scheme'] });
    return () => observer.disconnect();
  }, []);

  return scheme;
}
