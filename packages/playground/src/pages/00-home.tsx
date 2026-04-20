import { SiteLink } from '../components/SiteLink.js';
import { Features } from '../sections/Features.js';
import { Hero } from '../sections/Hero.js';
import { PromiseStrip } from '../sections/PromiseStrip.js';
import { SiteFooter } from '../sections/SiteFooter.js';

/**
 * Landing page. Hero → promise → features → CTA → footer. No live demo
 * here — the demo lives on its own page (`#demo`) so this page stays a
 * fast, scroll-light pitch. Nav + footer are global, rendered by the
 * App shell.
 */
export function HomePage() {
  return (
    <main className="site-page site-page--home">
      <Hero />
      <PromiseStrip />
      <Features />

      <section className="site-home-cta" aria-labelledby="home-cta-title">
        <div className="site-home-cta__inner">
          <div className="site-home-cta__kicker">Ready?</div>
          <h2 id="home-cta-title" className="site-home-cta__title">
            <em>Three</em> minutes. One wrapper. Any React app.
          </h2>
          <p className="site-home-cta__deck">
            The demo below is powered by the same library. Scroll the essay,
            open the panel, watch the graph form. Then copy-paste the
            quickstart and do the same in your project.
          </p>
          <div className="site-home-cta__actions">
            <SiteLink to="demo" className="site-home-cta__btn site-home-cta__btn--primary">
              Try the live demo
              <span aria-hidden>→</span>
            </SiteLink>
            <SiteLink to="docs" className="site-home-cta__btn">
              Read the docs
              <span aria-hidden>→</span>
            </SiteLink>
            <SiteLink to="philosophy" className="site-home-cta__btn">
              What it refuses
              <span aria-hidden>→</span>
            </SiteLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
