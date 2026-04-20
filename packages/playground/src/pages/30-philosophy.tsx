import { FiveLaws } from '../sections/FiveLaws.js';
import { SiteFooter } from '../sections/SiteFooter.js';

/**
 * Philosophy page — the five non-negotiable laws, expanded as an
 * editorial piece. Stit'Claude signature peak: typographic restraint,
 * numbered mono kickers, display italic titles, serif body, long
 * measure, hairline rules. The one page where the library speaks for
 * itself rather than demonstrating itself.
 */
export function PhilosophyPage() {
  return (
    <main className="site-page site-page--philosophy">
      <FiveLaws />
      <SiteFooter />
    </main>
  );
}
