import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface DeepestIndicatorProps {
  className?: string;
  style?: CSSProperties;
  /** Label shown to the left of the extract (default: "deepest"). */
  label?: string;
}

/**
 * Shows the station with the highest cumulative dwell. Hidden via CSS when
 * no stations exist.
 */
export function DeepestIndicator(props: DeepestIndicatorProps) {
  const { className, style, label = 'deepest' } = props;
  const { derived } = useMemoryGraphContext();
  const deepest = derived.deepest;

  const base = className ? `mg-deepest ${className}` : 'mg-deepest';
  const visibilityAttr = deepest ? { 'data-mg-visible': '' } : {};

  if (!deepest) {
    return <div className={base} style={style} {...visibilityAttr} aria-hidden />;
  }

  const seconds = Math.round(deepest.node.totalMs / 1000);
  const visitLabel = deepest.node.visits === 1 ? 'visit' : 'visits';

  return (
    <div className={base} style={style} {...visibilityAttr}>
      <span className="mg-deepest__k">{label}</span>
      <span className="mg-deepest__extract">{deepest.node.extract}</span>
      <span
        style={{
          color: 'var(--mg-fg-subtle)',
          fontFamily: 'var(--mg-font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          marginLeft: 6,
        }}
      >
        · {seconds}s · {deepest.node.visits} {visitLabel}
      </span>
    </div>
  );
}
