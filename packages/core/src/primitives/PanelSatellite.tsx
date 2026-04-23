import { type CSSProperties, type ReactNode } from 'react';

export interface PanelSatelliteProps {
  /** Children — typically one or more `<button class="mg-panel-satellite__button">`. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/**
 * Floating panel-level satellite · mirror of the graph's zoom satellite
 * but anchored to the TOP-right edge of the panel. Hosts panel-meta
 * actions (theme shop, future settings) rather than graph-view tools.
 *
 * Grammar parity with the zoom controls : hairline pill + backdrop-blur
 * saturate, 12px radius concentric with the interior buttons' 6px
 * (Rams rayons concentriques), opacity 0.5 at rest → 1 on hover /
 * focus-within, visibility gated by the root's `[data-mg-open]` so it
 * never lingers when the panel is closed.
 *
 * Two satellites, two semantics :
 *   · bottom-right = graph tools (zoom / fit)
 *   · top-right    = panel-extension tools (theme shop, settings)
 *
 * Layout is `position: absolute`, so the consumer mounts it inside a
 * `position: relative` container at panel level. On narrow viewports
 * (< 520px) it collapses back inside the panel to avoid overflowing.
 */
export function PanelSatellite(props: PanelSatelliteProps) {
  const { children, className, style } = props;
  const base = className ? `mg-panel-satellite ${className}` : 'mg-panel-satellite';
  return (
    <div
      className={base}
      style={style}
      role="toolbar"
      aria-label={props['aria-label'] ?? 'Panel tools'}
    >
      {children}
    </div>
  );
}
