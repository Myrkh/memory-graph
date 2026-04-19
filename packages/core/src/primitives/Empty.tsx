import type { CSSProperties, ReactNode } from 'react';

export interface EmptyProps {
  className?: string;
  style?: CSSProperties;
  /** Decorative glyph (default: "○"). */
  icon?: ReactNode;
  /** Message shown below the icon. */
  children?: ReactNode;
}

/**
 * Placeholder shown in the graph slot when no station exists yet. Usually
 * composed conditionally by the consumer, e.g.
 * `{stationCount === 0 ? <Empty /> : <Graph />}`.
 */
export function Empty(props: EmptyProps) {
  const { className, style, icon = '○', children } = props;
  const base = className ? `mg-empty ${className}` : 'mg-empty';

  return (
    <div className={base} style={style}>
      <div className="mg-empty__icon" aria-hidden>
        {icon}
      </div>
      <div className="mg-empty__text">
        {children ?? 'Scroll slowly. Paragraphs you dwell on become stations.'}
      </div>
    </div>
  );
}
