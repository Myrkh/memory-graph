import { useEffect, useRef, useState, type MouseEvent } from 'react';

const STORAGE_KEY = 'mg-playground:scheme';
type Scheme = 'light' | 'dark';

function readStoredScheme(): Scheme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // No stored preference → fall back to the OS choice.
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  return prefersDark ? 'dark' : 'light';
}

function applyScheme(scheme: Scheme): void {
  document.documentElement.dataset['mgScheme'] = scheme;
}

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/**
 * Theme toggle · Stit'Claude "Eclipse Reveal" signature.
 *
 *  · Button icon · 8 solar rays + central disc + crescent mask. The rays
 *    scale to zero on dark, the mask fades in, and the whole icon rotates
 *    cumulatively 360° per click — ease-expo-out, spring-like without
 *    being bouncy.
 *
 *  · Page transition · the new theme is painted over the old, clipped to
 *    a circle that grows from the exact click position (0 → 150vmax in
 *    700ms). The old theme stays static behind; the new one uncovers it
 *    like a passing eclipse. Driven by the View Transitions API with a
 *    dedicated `data-theme-transition` flag so it doesn't collide with
 *    the directional page slide already wired to `data-site-transition`.
 *
 *  · OS-aware on first load, localStorage-persistent afterwards.
 *  · `prefers-reduced-motion: reduce` collapses both animations to instant.
 */
export function ThemeToggle() {
  const [scheme, setScheme] = useState<Scheme>(readStoredScheme);
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    applyScheme(scheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, scheme);
    } catch {
      /* quota / private mode */
    }
  }, [scheme]);

  const isDark = scheme === 'dark';
  const next: Scheme = isDark ? 'light' : 'dark';

  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    // Capture click position for the circular reveal origin.
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    document.documentElement.style.setProperty('--theme-x', `${cx}px`);
    document.documentElement.style.setProperty('--theme-y', `${cy}px`);

    rotationRef.current += 360;
    const nextRotation = rotationRef.current;

    const commit = (): void => {
      setScheme(next);
      setRotation(nextRotation);
    };

    const doc = document as DocWithVT;
    if (typeof doc.startViewTransition === 'function') {
      document.documentElement.dataset['themeTransition'] = 'true';
      const t = doc.startViewTransition(commit);
      t.finished.finally(() => {
        delete document.documentElement.dataset['themeTransition'];
      });
    } else {
      commit();
    }
  };

  return (
    <button
      type="button"
      className="site-theme-toggle"
      onClick={handleClick}
      aria-label={`Switch to ${next} mode`}
      aria-pressed={isDark}
      title={`Switch to ${next} mode`}
      data-scheme={scheme}
      data-mg-id="ui-theme-toggle"
      data-mg-kind="kpi"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        focusable="false"
        className="site-theme-toggle__icon"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* 8 solar rays, scale to zero in dark mode */}
        <g className="site-theme-toggle__rays">
          <line x1={16} y1={3}    x2={16}   y2={6}  />
          <line x1={25.2} y1={6.8}  x2={23.1} y2={8.9} />
          <line x1={29} y1={16}   x2={26}   y2={16} />
          <line x1={25.2} y1={25.2} x2={23.1} y2={23.1} />
          <line x1={16} y1={29}   x2={16}   y2={26} />
          <line x1={6.8}  y1={25.2} x2={8.9}  y2={23.1} />
          <line x1={3}  y1={16}   x2={6}    y2={16} />
          <line x1={6.8}  y1={6.8}  x2={8.9}  y2={8.9} />
        </g>

        {/* Central disc */}
        <circle className="site-theme-toggle__disc" cx={16} cy={16} r={6.2} />

        {/* Crescent mask — opacity 0 in light, 1 in dark */}
        <circle className="site-theme-toggle__mask" cx={20} cy={13} r={6.2} />
      </svg>
    </button>
  );
}
