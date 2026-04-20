/**
 * The memory-graph brand mark — a 26×26 mini-graph that mirrors the
 * component's own visual grammar:
 *
 *  · three stations across the diagonal — circle (paragraph kind),
 *    diamond (figure kind), square (kpi kind) — showcasing the five-kind
 *    variety in one glance
 *  · two forward edges (hairline currentColor @ 45% opacity)
 *  · one return arc (coral, dashed 2/1.5, curving right back to station 1
 *    — the signature cubic Bézier the component refuses to negotiate)
 *  · one minute-axis hairline (dashed, ultra-faint) for temporal context
 *
 * No text, no fill, no drop-shadow. At 22px it still reads; at 28–32px
 * it sings. Consumer sizes it via CSS on the `.site-mark` class. Forward
 * edges + axis inherit `currentColor`; the accent stays coral.
 *
 * `animated` prop: when true, the return arc redraws itself once on hover
 * and the KPI square pulses — a micro-narrative Stit'Claude signature.
 */
export interface BrandMarkProps {
  /** Adds the `site-mark--animated` class — triggers the hover redraw. */
  animated?: boolean;
}

export function BrandMark({ animated = false }: BrandMarkProps) {
  const className = animated ? 'site-mark site-mark--animated' : 'site-mark';
  return (
    <svg
      viewBox="0 0 26 26"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* Minute-axis hint — one dashed hairline, ultra-faint, signals
          the temporal topology without making noise at logo size. */}
      <line className="site-mark__axis" x1={2} y1={13} x2={24} y2={13} />

      {/* Forward edges · 1→2 then 2→3 */}
      <line className="site-mark__edge" x1={5.5} y1={4.5} x2={13} y2={13} />
      <line className="site-mark__edge" x1={13} y1={13} x2={20} y2={20.5} />

      {/* Return arc · 3→1, control point off-canvas right for the signature curve */}
      <path
        className="site-mark__return"
        d="M 20 20.5 Q 28 12 5.5 4.5"
        fill="none"
      />

      {/* Station 1 · circle (paragraph) */}
      <circle className="site-mark__node" cx={5.5} cy={4.5} r={2.3} />

      {/* Station 2 · diamond (figure kind) — rotated square */}
      <path
        className="site-mark__node"
        d="M 13 10.2 L 15.8 13 L 13 15.8 L 10.2 13 Z"
      />

      {/* Station 3 · square (kpi kind) */}
      <rect
        className="site-mark__node"
        x={17.6}
        y={18.1}
        width={4.8}
        height={4.8}
      />
    </svg>
  );
}
