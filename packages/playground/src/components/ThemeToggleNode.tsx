import { useCurrentScheme } from '../hooks/useCurrentScheme.js';

export interface ThemeToggleNodeProps {
  /** Base radius of the node (already scaled by the graph's dwell function). */
  r: number;
}

/**
 * Custom node shape for the theme-toggle tracked element (`data-mg-id=
 * "ui-theme-toggle"`). Mirrors the ThemeToggle icon in the nav: a coral
 * disc in light mode, a crescent in dark mode. Reads the current scheme
 * from `<html data-mg-scheme>` via `useCurrentScheme` so the node morphs
 * live as the user flips the toggle.
 *
 * Rendered inside the graph's `<g transform="translate(x,y)">` wrapper,
 * so all coordinates are local (0,0 = node center). Wrapping chrome
 * (pulse, pinned ring, highlight ring, order label) is still managed
 * by the library — only the shape is custom.
 */
export function ThemeToggleNode({ r }: ThemeToggleNodeProps) {
  const scheme = useCurrentScheme();
  // Offset the mask circle to cut a crescent out of the disc. Mirrors
  // the exact geometry used in the nav toggle icon (proportionally).
  const maskDx = r * 0.55;
  const maskDy = -r * 0.35;
  return (
    <g className="theme-node" data-scheme={scheme}>
      <circle className="theme-node__disc" cx={0} cy={0} r={r} />
      <circle className="theme-node__mask" cx={maskDx} cy={maskDy} r={r} />
    </g>
  );
}
