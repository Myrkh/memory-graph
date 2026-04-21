/**
 * Release Notes · v0.2.0 highlights, editorial style.
 *
 * Five numbered moments, each with a mono kicker + italic display
 * subtitle + short prose. Hairline separators, Swiss-Quiet discipline.
 * Links to the full CHANGELOG on GitHub as the source of truth.
 */

interface ReleaseHighlight {
  kicker: string;
  title: string;
  body: string;
}

const V0_2_0: ReleaseHighlight[] = [
  {
    kicker: 'Route dimension',
    title: 'One graph across your whole site.',
    body:
      'Pass `route` on `<Root>` and the graph follows the reader from page to page. When two or more unique routes accumulate, the layout switches to 2D columns — one per route, chronologically ordered, with coral-dashed edges when you cross a boundary.',
  },
  {
    kicker: 'renderNode escape hatch',
    title: 'Give any tracked element its own shape.',
    body:
      '`<Graph renderNode={(item, ctx) => …}>` lets you return custom SVG for a specific node id without polluting `NodeKind` with site-specific values. Pulse, pinned ring, highlight ring and order label stay library-managed.',
  },
  {
    kicker: 'Signature zoom controls',
    title: 'Focal-point zoom + blur escamotage.',
    body:
      'A floating satellite on the panel\'s right edge with three Stit\'Claude-signature icons. The viewport center stays anchored through the transition; a brief blur keyframe masks any perceptual jitter. Keyboard-complete, reduced-motion-safe.',
  },
  {
    kicker: 'Intertab sync',
    title: 'Same origin, all tabs, zero dependency.',
    body:
      'Multiple tabs of the same origin stay in live sync via the browser\'s native `storage` event. A built-in guard skips redundant writes, breaking the cross-tab echo loop cleanly. Plus: an `onPersistError` callback for quota and private-mode failures.',
  },
  {
    kicker: 'Node Anatomy living docs',
    title: 'The docs track the component.',
    body:
      'Every specimen in the Node Anatomy section is rendered through the library\'s own CSS classes (`.mg-node`, `.mg-node-pulse`, `.mg-node-ring`…). If a radius, a color, or a keyframe changes upstream, the docs update automatically — no screenshots to maintain.',
  },
];

export function ReleaseNotes() {
  return (
    <section className="site-release" aria-labelledby="release-title">
      <header className="site-release__head">
        <div className="site-release__kicker">What's new</div>
        <h2 id="release-title" className="site-release__title">
          <em>v0.2.0</em> — Ambient memory-graph.
        </h2>
        <p className="site-release__deck">
          The graph becomes <em>ambient</em> — it follows the reader across a
          multi-screen site, not just a single article. Zero breaking change:
          every new surface is opt-in, and legacy graphs fall back to
          single-column mode.
        </p>
      </header>

      <ol className="site-release__list">
        {V0_2_0.map((h, i) => (
          <li key={h.kicker} className="site-release__item site-reveal" data-mg-id={`docs-release-${i}`}>
            <span className="site-release__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="site-release__item-body">
              <div className="site-release__item-kicker">{h.kicker}</div>
              <h3 className="site-release__item-title">{h.title}</h3>
              <p className="site-release__item-prose">{h.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <footer className="site-release__foot">
        <a
          className="site-release__link"
          href="https://github.com/Myrkh/memory-graph/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noreferrer noopener"
        >
          Full CHANGELOG on GitHub
          <span aria-hidden>↗</span>
        </a>
      </footer>
    </section>
  );
}
