/**
 * Graph control icons · Stit'Claude signature.
 *
 * Three 24×24 SVGs built on the component's own visual grammar — coral
 * nodes, hairline 1.3px strokes, round linecaps, dashed contours. Each
 * icon *enacts* its verb on hover rather than decorating it:
 *
 *  · Zoom In  · A coral node inside a 3-bladed hairline aperture at r=7.5
 *               (arcs at 120°). On hover, the aperture contracts toward
 *               the node AND the node grows — the camera metaphor: a
 *               closing aperture + magnified subject = zoom in.
 *  · Zoom Out · A coral node inside a dashed hairline frame ("what you
 *               see now"). On hover, the node shrinks, the frame expands,
 *               and 4 tiny satellite nodes cascade in at the corners —
 *               "zooming out reveals more."
 *  · Fit      · Two vertical dashed rails (the frame) bracket 4 inward-
 *               pointing chevrons at N/S/E/W and a central coral diamond
 *               (echoing our `heading`-kind node). On hover, chevrons
 *               clamp inward and the diamond pulses — "fit the content."
 *
 * Sub-elements are class-tagged so all motion lives in `graph-controls.css`.
 * No inline styles, no hardcoded transforms. All hover narratives are
 * reversible via `prefers-reduced-motion`.
 */

export function ZoomInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mg-icon mg-icon--zoom-in" aria-hidden focusable="false">
      {/* 3-bladed aperture at r=7.5 · contracts toward the node on hover,
       * like a camera diaphragm closing around the subject. */}
      <g className="mg-icon__aperture">
        <path d="M 19.5 12 A 7.5 7.5 0 0 1 15.75 18.5" />
        <path d="M 8.25 18.5 A 7.5 7.5 0 0 1 4.5 12" />
        <path d="M 8.25 5.5 A 7.5 7.5 0 0 1 15.75 5.5" />
      </g>
      {/* Central coral subject · grows on hover to signal magnification. */}
      <circle className="mg-icon__node" cx={12} cy={12} r={3.2} />
    </svg>
  );
}

export function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mg-icon mg-icon--zoom-out" aria-hidden focusable="false">
      {/* Dashed containment frame · "what you see now". */}
      <circle className="mg-icon__frame" cx={12} cy={12} r={5.2} />
      {/* Central coral node · shrinks on hover, simulating distance. */}
      <circle className="mg-icon__node mg-icon__node--center" cx={12} cy={12} r={3.2} />
      {/* 4 satellite nodes at the outer corners · cascade in on hover. */}
      <g className="mg-icon__satellites">
        <circle cx={5} cy={5} r={1} />
        <circle cx={19} cy={5} r={1} />
        <circle cx={5} cy={19} r={1} />
        <circle cx={19} cy={19} r={1} />
      </g>
    </svg>
  );
}

export function FitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mg-icon mg-icon--fit" aria-hidden focusable="false">
      {/* 2 vertical dashed rails · the frame boundary. */}
      <g className="mg-icon__rails">
        <line x1={3} y1={7} x2={3} y2={17} />
        <line x1={21} y1={7} x2={21} y2={17} />
      </g>
      {/* 4 inward-pointing chevrons at N/S/E/W · clamp inward on hover. */}
      <g className="mg-icon__chevrons">
        <path className="mg-icon__chevron mg-icon__chevron--top" d="M 10 3 L 14 3 L 12 6 Z" />
        <path className="mg-icon__chevron mg-icon__chevron--bottom" d="M 10 21 L 14 21 L 12 18 Z" />
        <path className="mg-icon__chevron mg-icon__chevron--left" d="M 3 10 L 3 14 L 6 12 Z" />
        <path className="mg-icon__chevron mg-icon__chevron--right" d="M 21 10 L 21 14 L 18 12 Z" />
      </g>
      {/* Central coral diamond · echoes our heading-kind node grammar. */}
      <path className="mg-icon__diamond" d="M 12 9 L 15 12 L 12 15 L 9 12 Z" />
    </svg>
  );
}
