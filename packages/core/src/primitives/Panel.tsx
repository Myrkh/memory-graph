import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useMemoryGraphContext } from './context.js';

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
 *
 * Accessibility:
 * - `role="dialog"` + `aria-modal="true"` while open — screen readers treat
 *   the panel as a modal region.
 * - `aria-hidden="true"` when closed so the off-screen panel is invisible to
 *   assistive tech.
 * - Focus trapped inside the panel while open, via {@link useFocusTrap}.
 *   Focus restored to the previously-focused element on close.
 */
export function Panel(props: PanelProps) {
  const { className, style, children } = props;
  const { open } = useMemoryGraphContext();
  const ref = useRef<HTMLElement | null>(null);
  useFocusTrap(ref, open);

  const baseClass = className ? `mg-panel ${className}` : 'mg-panel';

  return (
    <aside
      ref={ref}
      className={baseClass}
      style={style}
      role="dialog"
      aria-modal={open ? true : undefined}
      aria-hidden={!open}
      aria-label={props['aria-label'] ?? 'Memory graph panel'}
      data-mg-panel
    >
      {children}
    </aside>
  );
}
