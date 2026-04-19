import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';
import { formatDuration } from '../internal/format.js';

export interface StatsProps {
  className?: string;
  style?: CSSProperties;
  labels?: {
    nodes?: string;
    loops?: string;
    time?: string;
    pins?: string;
  };
}

/**
 * Four-metric grid shown under the title: nodes, loops, read time, pins.
 * Reads live derived values from context — updates automatically.
 */
export function Stats(props: StatsProps) {
  const { className, style, labels } = props;
  const { derived } = useMemoryGraphContext();
  const duration = formatDuration(derived.totalMs);

  const base = className ? `mg-stats ${className}` : 'mg-stats';

  return (
    <div className={base} style={style}>
      <StatCell k={labels?.nodes ?? 'nodes'} v={String(derived.stationCount)} />
      <StatCell k={labels?.loops ?? 'loops'} v={String(derived.loopCount)} accent />
      <StatCell
        k={labels?.time ?? 'time'}
        v={duration.value}
        unit={duration.unit}
        secondUnit={duration.secondUnit}
      />
      <StatCell k={labels?.pins ?? 'pins'} v={String(derived.pinCount)} />
    </div>
  );
}

interface StatCellProps {
  k: string;
  v: string;
  unit?: string | undefined;
  secondUnit?: string | undefined;
  accent?: boolean;
}

function StatCell(props: StatCellProps) {
  const { k, v, unit, secondUnit, accent } = props;
  const vClass = accent ? 'mg-stat__v mg-stat__v--accent' : 'mg-stat__v';
  return (
    <div className="mg-stat">
      <div className="mg-stat__k">{k}</div>
      <div className={vClass}>
        {v}
        {unit ? <span className="mg-stat__u">{unit}</span> : null}
        {secondUnit ? <span className="mg-stat__u">{secondUnit}</span> : null}
      </div>
    </div>
  );
}
