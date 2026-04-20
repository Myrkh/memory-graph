import { DemoEssay } from '../components/DemoEssay.js';
import { SiteFooter } from '../sections/SiteFooter.js';

/**
 * Demo page · the editorial essay wired to the library. The `<Handle>`
 * lives in the app shell (TopNav) so it's available on every page;
 * this page simply renders the essay content and lets the user scroll.
 *
 * Variant switcher removed in v0.2.0 · the three Handle variants
 * (permanent / ghost / none) are documented in the Docs page and not
 * switched at runtime. Keeps the demo focused on content consumption.
 */
export function DemoPage() {
  return (
    <main className="site-page site-page--demo">
      <DemoEssay kicker="Live · scroll and read" />
      <SiteFooter />
    </main>
  );
}
