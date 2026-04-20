import { useState } from 'react';
import { SiteLink } from '../components/SiteLink.js';

const INSTALL_COMMAND = 'npm i @myrkh/memory-graph';

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <section className="site-hero" aria-labelledby="hero-title">
      <div className="site-hero__text">
        <div className="site-hero__kicker">
          <span>@myrkh/memory-graph</span>
          <span aria-hidden>·</span>
          <span>v0.1.0</span>
          <span aria-hidden>·</span>
          <span>MIT</span>
        </div>

        <h1
          id="hero-title"
          className="site-hero__title site-reveal"
          data-mg-id="home-hero-title"
        >
          See how people <em>actually</em> read.
        </h1>

        <p
          className="site-hero__deck site-reveal"
          data-mg-id="home-hero-deck"
        >
          A React library that turns reading into a graph. Drop it into any app,
          mark the elements that matter, watch the trail form behind a slide-out
          panel — stations, passages, edges, annotations, the whole attention
          signature.
        </p>

        <div className="site-hero__install" role="group" aria-label="Installation">
          <span className="site-hero__install-prompt" aria-hidden>$</span>
          <code className="site-hero__install-cmd">{INSTALL_COMMAND}</code>
          <button
            type="button"
            className="site-hero__install-copy"
            onClick={copyInstall}
            aria-label="Copy install command"
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>

        <div className="site-hero__ctas">
          <SiteLink to="demo" className="site-hero__cta site-hero__cta--primary">
            Try the demo
            <span aria-hidden>↓</span>
          </SiteLink>
          <a
            href="https://github.com/Myrkh/memory-graph"
            className="site-hero__cta"
            target="_blank"
            rel="noreferrer noopener"
          >
            Star on GitHub
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <figure className="site-hero__visual" aria-hidden>
        <HeroGraph />
        <figcaption className="site-hero__visual-cap">
          Five kinds · four strategies · one living graph
        </figcaption>
      </figure>
    </section>
  );
}

/**
 * Decorative mini-graph. Static SVG mimicking the real rendering grammar —
 * coral nodes, hairline minute marks, dashed coral return arc curving right.
 * Shape variety mirrors the five kinds (circle · concentric · square ·
 * diamond · rounded square). Non-interactive, no state; purely a signature
 * above the fold.
 */
function HeroGraph() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="site-hero__graph"
      role="img"
      aria-label="Memory graph illustration"
    >
      <line className="site-hero__axis" x1="24" y1="40" x2="296" y2="40" />
      <line className="site-hero__axis" x1="24" y1="100" x2="296" y2="100" />
      <line className="site-hero__axis" x1="24" y1="160" x2="296" y2="160" />

      <line className="site-hero__edge" x1="120" y1="36" x2="200" y2="96" />
      <line className="site-hero__edge" x1="200" y1="96" x2="140" y2="156" />
      <path
        className="site-hero__return"
        d="M 140 156 Q 260 100 120 36"
        fill="none"
      />

      <circle className="site-hero__node site-hero__node--halo" cx={120} cy={36} r={12} />
      <circle className="site-hero__node" cx={120} cy={36} r={9} />
      <text className="site-hero__order" x={120} y={36}>01</text>

      <rect className="site-hero__node" x={192} y={88} width={16} height={16} />
      <text className="site-hero__order" x={200} y={96}>02</text>

      <rect
        className="site-hero__node"
        x={132}
        y={148}
        width={16}
        height={16}
        transform="rotate(45 140 156)"
      />
      <text className="site-hero__order" x={140} y={156}>03</text>

      <rect className="site-hero__node" x={248} y={32} width={16} height={16} rx={2} ry={2} />
      <text className="site-hero__order" x={256} y={40}>04</text>
    </svg>
  );
}
