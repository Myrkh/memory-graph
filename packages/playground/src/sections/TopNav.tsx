import { BrandMark } from '../components/BrandMark.js';
import { SiteLink } from '../components/SiteLink.js';
import type { Page } from '../utils/navigation.js';

const NAV_ITEMS: { hash: Page; label: string }[] = [
  { hash: 'home', label: 'Overview' },
  { hash: 'demo', label: 'Live demo' },
  { hash: 'docs', label: 'Docs' },
  { hash: 'philosophy', label: 'Philosophy' },
];

export interface TopNavProps {
  current: string;
}

export function TopNav({ current }: TopNavProps) {
  return (
    <header className="site-nav" role="banner">
      <SiteLink to="home" className="site-nav__brand" aria-label="memory-graph — home">
        <BrandMark animated />
        <span className="site-nav__brand-text">memory-graph</span>
        <span className="site-nav__brand-version">v0.1.0</span>
      </SiteLink>

      <nav className="site-nav__links" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = item.hash === current;
          const activeAttr = active ? { 'aria-current': 'page' as const } : {};
          return (
            <SiteLink
              key={item.hash}
              to={item.hash}
              className={
                active
                  ? 'site-nav__link site-nav__link--active'
                  : 'site-nav__link'
              }
              {...activeAttr}
            >
              {item.label}
            </SiteLink>
          );
        })}
      </nav>

      <div className="site-nav__ctas">
        <a
          href="https://github.com/Myrkh/memory-graph"
          className="site-nav__cta"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
          <span aria-hidden>↗</span>
        </a>
        <a
          href="https://www.npmjs.com/package/@myrkh/memory-graph"
          className="site-nav__cta site-nav__cta--accent"
          target="_blank"
          rel="noreferrer noopener"
        >
          npm
          <span aria-hidden>↗</span>
        </a>
      </div>
    </header>
  );
}
