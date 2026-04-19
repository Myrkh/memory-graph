import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface PinToastProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Transient pill at the bottom center of the viewport. Appears for ~1.6s
 * whenever `context.showToast(message)` is called. Stays mounted so it can
 * animate in/out smoothly via CSS — visibility is driven by the
 * `[data-mg-visible]` data attribute.
 */
export function PinToast(props: PinToastProps) {
  const { className, style } = props;
  const { toastMessage } = useMemoryGraphContext();

  const base = className ? `mg-pin-toast ${className}` : 'mg-pin-toast';
  const visibilityAttr = toastMessage ? { 'data-mg-visible': '' } : {};

  return (
    <div
      className={base}
      style={style}
      role="status"
      aria-live="polite"
      aria-atomic
      {...visibilityAttr}
    >
      <span className="mg-pin-toast__dot" aria-hidden />
      <span>{toastMessage}</span>
    </div>
  );
}
