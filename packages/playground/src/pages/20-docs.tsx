import { ApiTable } from '../sections/ApiTable.js';
import { NodeAnatomy } from '../sections/NodeAnatomy.js';
import { QuickstartBlock } from '../sections/QuickstartBlock.js';
import { ReleaseNotes } from '../sections/ReleaseNotes.js';
import { SiteFooter } from '../sections/SiteFooter.js';

/**
 * Docs page — install + quickstart code blocks + a summary API table
 * covering primitives, hooks, and DOM attributes. The full narrative
 * reference + CHANGELOG live on GitHub; this page is the fast-access
 * cheat-sheet for developers wiring it up for the first time.
 */
export function DocsPage() {
  return (
    <main className="site-page site-page--docs">
      <header className="site-docs-head">
        <div className="site-docs-head__kicker">Documentation · v0.2.0</div>
        <h1 className="site-docs-head__title">
          Everything you need. <em>Nothing</em> you don't.
        </h1>
        <p className="site-docs-head__deck">
          The shortest path from <code>npm install</code> to a graph of your
          own. For the full API reference, guides, and recipes, the source
          of truth is the README on GitHub — linked everywhere.
        </p>
      </header>

      <QuickstartBlock />
      <ApiTable />
      <NodeAnatomy />
      <ReleaseNotes />

      <section className="site-docs-more" aria-labelledby="docs-more-title">
        <div className="site-docs-more__inner">
          <h2 id="docs-more-title" className="site-docs-more__title">
            More <em>depth</em>.
          </h2>
          <p className="site-docs-more__deck">
            The README on GitHub goes further — every prop, every option,
            every edge case. The CHANGELOG records every release note.
            Open an issue if something is missing.
          </p>
          <div className="site-docs-more__links">
            <a
              className="site-docs-more__link"
              href="https://github.com/Myrkh/memory-graph#readme"
              target="_blank"
              rel="noreferrer noopener"
            >
              Full README
              <span aria-hidden>↗</span>
            </a>
            <a
              className="site-docs-more__link"
              href="https://github.com/Myrkh/memory-graph/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noreferrer noopener"
            >
              Changelog
              <span aria-hidden>↗</span>
            </a>
            <a
              className="site-docs-more__link"
              href="https://github.com/Myrkh/memory-graph/issues/new"
              target="_blank"
              rel="noreferrer noopener"
            >
              Report an issue
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
