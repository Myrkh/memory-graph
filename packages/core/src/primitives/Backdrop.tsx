import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface BackdropProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Click-dismiss overlay behind the panel. Visible (via CSS) whenever the
 * root is in the open state. Rendered as a `<button>` for keyboard
 * accessibility — Escape still works through the keyboard shortcut primitive.
 */
export function Backdrop(props: BackdropProps) {
  const { className, style } = props;
  const { open, closePanel } = useMemoryGraphContext();

  const baseClass = className ? `mg-backdrop ${className}` : 'mg-backdrop';

  return (
    <button
      type="button"
      className={baseClass}
      style={style}
      tabIndex={open ? 0 : -1}
      aria-hidden={!open}
      aria-label="Close memory graph"
      onClick={closePanel}
    />
  );
}
