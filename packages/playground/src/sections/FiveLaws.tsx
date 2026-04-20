interface Law {
  num: string;
  title: string;
  lede: string;
  body: string;
}

const LAWS: Law[] = [
  {
    num: '01',
    title: 'Zero network.',
    lede: 'Everything lives on the device.',
    body:
      "No telemetry, no sync, no analytics beacon. The reading trail is written to localStorage under a key derived from the URL, and that's where it stays. Exportable as JSON at any time; importable back the same way. The reader owns the record; the library is a silent witness.",
  },
  {
    num: '02',
    title: 'Passive observation.',
    lede: 'The library watches. It does not speak.',
    body:
      "The panel is closed until you open it. The graph materializes only when you ask. Paragraphs receive no chrome. Annotations surface only on explicit selection. No notification, no suggestion, no nudge — the component responds to gestures it is given, never to ones it imagines.",
  },
  {
    num: '03',
    title: 'Temporal topology only.',
    lede: 'Y axis is firstAt. Always.',
    body:
      "Every station is placed vertically according to the minute it was first promoted. Never force-directed. Never spatial. The graph reads as a chronological descent — from the first paragraph you lingered on at the top to the most recent at the bottom. Scroll it and you re-experience the order of your own attention.",
  },
  {
    num: '04',
    title: 'Return-edges curve right.',
    lede: 'Cubic Bézier, non-negotiable signature.',
    body:
      "When the reader comes back to an earlier paragraph, the library draws an arc — not a straight line. The control point sits at max(fromX, toX) + RETURN_BEND (70px by default). Changing the constant would break the visual recognition; the curve is the identity of the component, not a stylistic afterthought.",
  },
  {
    num: '05',
    title: 'Three-second dwell.',
    lede: 'Below the threshold, it is a passage.',
    body:
      "DWELL_MS = 3000. It is not arbitrary. It is calibrated against skim velocity — the minimum dwell at which comprehension becomes statistically probable. Below three seconds, a paragraph is recorded as a passage (crossed) rather than a station (inhabited). The tariff separates reading from scrolling; without it, every motion would produce noise.",
  },
];

export function FiveLaws() {
  return (
    <section className="site-laws" aria-labelledby="laws-title">
      <header className="site-laws__head">
        <div className="site-laws__kicker">The five laws</div>
        <h1 id="laws-title" className="site-laws__title">
          What the library <em>refuses</em>.
        </h1>
        <p className="site-laws__deck">
          Every feature in memory-graph is judged against five non-negotiable
          laws. An innovation that violates any of them is not an innovation —
          it is a degradation. These are the rules the component inherited
          from its vanilla ancestor, and the rules this port kept without
          softening.
        </p>
      </header>

      <ol className="site-laws__list">
        {LAWS.map((law) => (
          <li
            key={law.num}
            className="site-laws__item site-reveal"
            data-mg-id={`philosophy-law-${law.num}`}
          >
            <div className="site-laws__item-head">
              <span className="site-laws__item-num">{law.num}</span>
              <h2 className="site-laws__item-title">{law.title}</h2>
            </div>
            <p className="site-laws__item-lede">{law.lede}</p>
            <p className="site-laws__item-body">{law.body}</p>
          </li>
        ))}
      </ol>

      <footer className="site-laws__foot">
        <hr className="site-laws__rule" aria-hidden />
        <p className="site-laws__signoff">
          Five laws. One mirror. No shortcuts.
        </p>
      </footer>
    </section>
  );
}
