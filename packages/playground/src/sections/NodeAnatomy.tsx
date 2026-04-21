/**
 * Node Anatomy · living documentation. Every specimen is rendered through
 * the library's own CSS classes (`.mg-node`, `.mg-node-shape`, `.mg-node-
 * pulse`, `.mg-node-ring`…), so the docs track the component automatically.
 */

interface Stop { r: number; label?: string; note?: string }
interface Kind { kind: 'paragraph' | 'heading' | 'kpi' | 'figure' | 'code'; label: string; signal: string }
interface State { key: string; label: string; attr: string | null; note: string }

const SIZING: Stop[] = [
  { r: 3.5, label: 'PASSAGE', note: 'below visit + dwell thresholds' },
  { r: 5, label: 'MIN', note: 'NODE_R_MIN · first station' },
  { r: 7 }, { r: 9 }, { r: 11 },
  { r: 14, label: 'MAX', note: 'NODE_R_MAX · deepest station' },
];

const KINDS: Kind[] = [
  { kind: 'paragraph', label: 'Paragraph', signal: 'Body text · the default, inferred from <p>.' },
  { kind: 'heading', label: 'Heading', signal: 'Landmarks · coral halo flags titled sections.' },
  { kind: 'kpi', label: 'KPI', signal: 'Key metric or stat callout.' },
  { kind: 'figure', label: 'Figure', signal: 'Image, chart, diagram · rotated square.' },
  { kind: 'code', label: 'Code', signal: 'Snippet or code block · rounded corners.' },
];

const STATES: State[] = [
  { key: 'base', label: 'Station', attr: null, note: 'Coral dot · the base form, radius from dwell.' },
  { key: 'current', label: 'Current', attr: 'data-mg-current', note: 'Pulsing · your eye is here right now.' },
  { key: 'pinned', label: 'Pinned', attr: 'data-mg-pinned', note: 'Outer ring · marked for return.' },
  { key: 'highlight', label: 'Highlighted', attr: 'data-mg-highlight', note: 'Dashed ring · bidirectional hover.' },
];

export function NodeAnatomy() {
  return (
    <section className="site-anatomy" aria-labelledby="anatomy-title">
      <header className="site-anatomy__head">
        <div className="site-anatomy__kicker">Node anatomy</div>
        <h2 id="anatomy-title" className="site-anatomy__title">
          Every dot <em>encodes</em> something.
        </h2>
        <p className="site-anatomy__deck">
          Shape tells you what the block <em>is</em>. Size tells you how much
          time it kept you. Rings and pulses tell you the state. The whole
          grammar is small — five shapes, four states, one coral.
        </p>
      </header>

      <SizingBlock />
      <KindsBlock />
      <StatesBlock />
    </section>
  );
}

/* -- Sizing ramp -------------------------------------------------------- */

function SizingBlock() {
  const MAX_R = 14;
  const PAD = 6;
  const STEP = 48;
  const height = MAX_R * 2 + PAD * 2;
  const width = STEP * SIZING.length + PAD * 2;
  const baselineY = height - PAD - MAX_R;

  return (
    <div className="site-anatomy__block site-reveal" data-mg-id="docs-anatomy-sizing">
      <header className="site-anatomy__block-head">
        <span className="site-anatomy__block-kicker">Sizing</span>
        <h3 className="site-anatomy__block-title">
          Linear from <code>NODE_R_MIN</code> to <code>NODE_R_MAX</code>,
          scaled against the deepest station.
        </h3>
      </header>

      <svg
        className="mg-svg site-anatomy__ramp"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Node size ramp from passage to maximum station"
      >
        <line
          className="site-anatomy__ramp-axis"
          x1={PAD}
          y1={baselineY}
          x2={width - PAD}
          y2={baselineY}
        />
        {SIZING.map((stop, i) => {
          const cx = PAD + STEP / 2 + i * STEP;
          const isPassage = i === 0;
          const showOrder = stop.r >= 7;
          return (
            <g
              key={stop.r}
              className="mg-node"
              data-mg-type={isPassage ? 'passage' : 'station'}
              transform={`translate(${cx},${baselineY})`}
            >
              <circle className="mg-node-shape" cx={0} cy={0} r={stop.r} />
              {showOrder ? (
                <text className="mg-node-order" x={0} y={0}>
                  {String(i).padStart(2, '0')}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="site-anatomy__ramp-legend">
        {SIZING.map((stop, i) => (
          <div key={i} className="site-anatomy__ramp-stop">
            <span className="site-anatomy__ramp-r">r = {stop.r}</span>
            {stop.label ? (
              <span className="site-anatomy__ramp-label">{stop.label}</span>
            ) : (
              <span className="site-anatomy__ramp-label site-anatomy__ramp-label--ghost">·</span>
            )}
            {stop.note ? (
              <span className="site-anatomy__ramp-note">{stop.note}</span>
            ) : null}
          </div>
        ))}
      </div>

      <p className="site-anatomy__caption">
        <code>r = NODE_R_MIN + (NODE_R_MAX − NODE_R_MIN) × (totalMs / maxMs)</code>
        <span> — passages stay fixed at <code>3.5px</code>. Order labels appear only when <code>r ≥ 7</code>, so small nodes stay quiet.</span>
      </p>
    </div>
  );
}

/* -- Kinds · five shapes ------------------------------------------------ */

function KindsBlock() {
  return (
    <div className="site-anatomy__block site-reveal" data-mg-id="docs-anatomy-kinds">
      <header className="site-anatomy__block-head">
        <span className="site-anatomy__block-kicker">Kinds</span>
        <h3 className="site-anatomy__block-title">
          Five shapes. One coral. <em>Zero</em> ambiguity.
        </h3>
      </header>

      <div className="site-anatomy__grid site-anatomy__grid--5">
        {KINDS.map((k) => (
          <KindTile key={k.kind} kind={k} />
        ))}
      </div>
    </div>
  );
}

function KindTile({ kind }: { kind: Kind }) {
  const r = 11;
  const size = 40;
  return (
    <article className="site-anatomy__tile">
      <svg
        className="mg-svg site-anatomy__tile-svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${kind.label} node specimen`}
      >
        <g
          className="mg-node"
          data-mg-type="station"
          data-mg-kind={kind.kind}
          transform={`translate(${size / 2},${size / 2})`}
        >
          <KindShape kind={kind.kind} r={r} />
        </g>
      </svg>
      <div className="site-anatomy__tile-body">
        <div className="site-anatomy__tile-label">{kind.label}</div>
        <code className="site-anatomy__tile-attr">
          data-mg-kind="{kind.kind}"
        </code>
        <p className="site-anatomy__tile-note">{kind.signal}</p>
      </div>
    </article>
  );
}

function KindShape({ kind, r }: { kind: Kind['kind']; r: number }) {
  if (kind === 'kpi') {
    return <rect className="mg-node-shape" x={-r} y={-r} width={r * 2} height={r * 2} />;
  }
  if (kind === 'code') {
    return (
      <rect className="mg-node-shape" x={-r} y={-r} width={r * 2} height={r * 2} rx={2} ry={2} />
    );
  }
  if (kind === 'figure') {
    const d = r * 1.05;
    return (
      <rect
        className="mg-node-shape"
        x={-d}
        y={-d}
        width={d * 2}
        height={d * 2}
        transform="rotate(45)"
      />
    );
  }
  if (kind === 'heading') {
    return (
      <>
        <circle className="mg-node-shape-halo" cx={0} cy={0} r={r + 3} />
        <circle className="mg-node-shape" cx={0} cy={0} r={r} />
      </>
    );
  }
  return <circle className="mg-node-shape" cx={0} cy={0} r={r} />;
}

/* -- States · live-animated specimens ----------------------------------- */

function StatesBlock() {
  return (
    <div className="site-anatomy__block site-reveal" data-mg-id="docs-anatomy-states">
      <header className="site-anatomy__block-head">
        <span className="site-anatomy__block-kicker">States</span>
        <h3 className="site-anatomy__block-title">
          Data-attributes <em>drive</em> every visual layer.
        </h3>
      </header>

      <div className="site-anatomy__grid site-anatomy__grid--4">
        {STATES.map((s) => (
          <StateTile key={s.key} state={s} />
        ))}
      </div>

      <p className="site-anatomy__caption">
        Hover any node in the panel to see <strong>chain highlighting</strong>:
        the 1-hop ego network stays lit, everything else fades to 0.15.
        No movement — only visual weight shifts.
      </p>
    </div>
  );
}

function StateTile({ state }: { state: State }) {
  const r = 10;
  const size = 48;
  const attrs = state.attr ? { [state.attr]: '' } : {};
  return (
    <article className="site-anatomy__tile">
      <svg
        className="mg-svg site-anatomy__tile-svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${state.label} state specimen`}
      >
        <g
          className="mg-node"
          data-mg-type="station"
          data-mg-kind="paragraph"
          {...attrs}
          transform={`translate(${size / 2},${size / 2})`}
        >
          {state.attr === 'data-mg-current' ? (
            <circle className="mg-node-pulse" cx={0} cy={0} r={5} />
          ) : null}
          {state.attr === 'data-mg-pinned' ? (
            <circle className="mg-node-ring" cx={0} cy={0} r={r + 4} fill="none" />
          ) : null}
          {state.attr === 'data-mg-highlight' ? (
            <circle className="mg-node-highlight-ring" cx={0} cy={0} r={r + 4} fill="none" />
          ) : null}
          <circle className="mg-node-shape" cx={0} cy={0} r={r} />
        </g>
      </svg>
      <div className="site-anatomy__tile-body">
        <div className="site-anatomy__tile-label">{state.label}</div>
        <code className="site-anatomy__tile-attr">
          {state.attr ? `[${state.attr}]` : '— default'}
        </code>
        <p className="site-anatomy__tile-note">{state.note}</p>
      </div>
    </article>
  );
}
