import type { CSSProperties, ReactNode } from 'react';

export interface PanelProps {
  className?: string;
  style?: CSSProperties;
  /** Accessible label for the aside region. */
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * The slide-in surface. Visibility is driven by `[data-mg-open]` on the root,
 * so Panel itself is always mounted — it simply translates off-screen when
 * closed.
 */
export function Panel(props: PanelProps) {
  const { className, style, children } = props;
  const baseClass = className ? `mg-panel ${className}` : 'mg-panel';

  return (
    <aside
      className={baseClass}
      style={style}
      aria-label={props['aria-label'] ?? 'Memory graph panel'}
      data-mg-panel
    >
      {children}
    </aside>
  );
}
