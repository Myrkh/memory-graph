import { BrandMark } from '../components/BrandMark.js';
import { SiteLink } from '../components/SiteLink.js';
import { StitclaudeMark } from '../components/StitclaudeMark.js';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <BrandMark animated />
          <div>
            <div className="site-footer__brand-name">memory-graph</div>
            <div className="site-footer__brand-tag">
              Made with deliberate slowness.
            </div>
          </div>
        </div>

        <nav className="site-footer__cols" aria-label="Footer">
          <div className="site-footer__col">
            <div className="site-footer__col-kicker">Library</div>
            <SiteLink className="site-footer__link" to="home">Overview</SiteLink>
            <SiteLink className="site-footer__link" to="demo">Live demo</SiteLink>
            <SiteLink className="site-footer__link" to="docs">Docs</SiteLink>
            <SiteLink className="site-footer__link" to="philosophy">Philosophy</SiteLink>
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-kicker">Code</div>
            <a
              className="site-footer__link"
              href="https://github.com/Myrkh/memory-graph"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub ↗
            </a>
            <a
              className="site-footer__link"
              href="https://www.npmjs.com/package/@myrkh/memory-graph"
              target="_blank"
              rel="noreferrer noopener"
            >
              npm ↗
            </a>
            <a
              className="site-footer__link"
              href="https://github.com/Myrkh/memory-graph/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noreferrer noopener"
            >
              Changelog ↗
            </a>
            <a
              className="site-footer__link"
              href="https://github.com/Myrkh/memory-graph/issues"
              target="_blank"
              rel="noreferrer noopener"
            >
              Issues ↗
            </a>
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-kicker">Author</div>
            <a
              className="site-footer__link"
              href="https://github.com/Myrkh"
              target="_blank"
              rel="noreferrer noopener"
            >
              @Myrkh ↗
            </a>
            <span className="site-footer__link site-footer__link--static">
              Yoann Dumont
            </span>
          </div>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span className="site-footer__legal">
          © {year} · MIT License · Free to use, fork, remix.
        </span>
        <span className="site-footer__meta">
          v0.2.0 · built with TypeScript, React, and a lot of patience.
        </span>
      </div>

      <div className="site-footer__credit" aria-label="Design credit">
        <span className="site-footer__credit-logo" aria-hidden>
          <StitclaudeMark />
        </span>
        <span className="site-footer__credit-text">
          Designed with the <strong>Stit'Claude</strong> skill <em>v2</em>
          — <span className="site-footer__credit-sub">on ne fait plus de designers comme ça aujourd'hui.</span>
        </span>
      </div>
    </footer>
  );
}
