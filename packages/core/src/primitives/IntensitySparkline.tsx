import { useMemo, type CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 28;

export interface IntensitySparklineProps {
  className?: string;
  style?: CSSProperties;
  /** Label shown above the sparkline (default: "intensity"). */
  label?: string;
}

/**
 * Last-60-minutes dwell sparkline. Bar heights are proportional to the
 * seconds logged in each minute bucket, normalized against the tallest bar.
 * Hidden (via rendering `null`) when no buckets have been recorded.
 */
export function IntensitySparkline(props: IntensitySparklineProps) {
  const { className, style, label = 'intensity' } = props;
  const { state } = useMemoryGraphContext();
  const buckets = state.intensityBuckets;

  const data = useMemo(() => {
    if (buckets.length === 0) return null;
    let maxSec = 1;
    for (const b of buckets) if (b.s > maxSec) maxSec = b.s;
    const barWidth = VIEW_WIDTH / Math.max(buckets.length, 1);
    const bars = buckets.map((b, i) => {
      const h = Math.max(2, (b.s / maxSec) * (VIEW_HEIGHT - 2));
      return {
        x: i * barWidth + 0.5,
        y: VIEW_HEIGHT - h,
        w: Math.max(1, barWidth - 1),
        h,
      };
    });
    const firstMs = buckets[0]!.m * 60_000;
    const lastMs = buckets[buckets.length - 1]!.m * 60_000;
    return {
      bars,
      rangeText: `${buckets.length} min · ${formatHM(firstMs)} → ${formatHM(lastMs)}`,
    };
  }, [buckets]);

  if (!data) return null;

  const base = className ? `mg-intensity ${className}` : 'mg-intensity';

  return (
    <div className={base} style={style}>
      <div className="mg-intensity__row">
        <span className="mg-intensity__k">{label}</span>
        <span className="mg-intensity__range">{data.rangeText}</span>
      </div>
      <svg
        className="mg-sparkline"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {data.bars.map((bar, i) => (
          <rect
            key={i}
            className="mg-sparkline__bar"
            x={bar.x}
            y={bar.y}
            width={bar.w}
            height={bar.h}
            rx={0.5}
          />
        ))}
      </svg>
    </div>
  );
}

function formatHM(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
