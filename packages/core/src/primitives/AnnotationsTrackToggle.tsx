import type { CSSProperties, ReactNode } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface AnnotationsTrackToggleProps {
  className?: string;
  style?: CSSProperties;
  /** Label text — uppercase mono kicker style (default: "Track"). */
  children?: ReactNode;
}

/**
 * Text-based toggle button for the AnnotationsTrack side column. Mounted
 * inside the panel head next to the CloseButton. Hidden automatically
 * when no annotation exists yet — the Track is meaningless in that case.
 */
export function AnnotationsTrackToggle(props: AnnotationsTrackToggleProps) {
  const { className, style, children = 'Track' } = props;
  const { trackOpen, setTrackOpen, state } = useMemoryGraphContext();

  if (state.annotations.size === 0) return null;

  const base = className
    ? `mg-annotations-track-toggle ${className}`
    : 'mg-annotations-track-toggle';
  const activeAttr = trackOpen ? { 'data-mg-active': '' } : {};

  return (
    <button
      type="button"
      className={base}
      style={style}
      aria-pressed={trackOpen}
      aria-label="Toggle annotations track"
      onClick={() => setTrackOpen(!trackOpen)}
      {...activeAttr}
    >
      {children}
    </button>
  );
}
