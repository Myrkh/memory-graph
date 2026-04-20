const INSTALL = `# Install the library
npm i @myrkh/memory-graph

# or with pnpm / yarn
pnpm add @myrkh/memory-graph
yarn add @myrkh/memory-graph`;

const SETUP = `// main.tsx
import '@myrkh/memory-graph/styles';
import '@myrkh/memory-graph/themes/stit-claude';

// App.tsx — wrap once, anywhere
import { MemoryGraph } from '@myrkh/memory-graph';

export function App() {
  return (
    <MemoryGraph.Root storageKey="mg:my-app">
      <YourContent />

      <MemoryGraph.Handle />
      <MemoryGraph.Panel>{/* head, stats, graph, footer */}</MemoryGraph.Panel>
      <MemoryGraph.Backdrop />
      <MemoryGraph.Tooltip />
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.KeyboardShortcuts />
    </MemoryGraph.Root>
  );
}`;

const USAGE = `// Then anywhere in the tree — any DOM element:
<p data-mg-id="intro">…</p>                  /* viewport dwell (default) */
<h2 data-mg-id="s1">…</h2>                   /* inferred: heading kind  */
<button data-mg-id="tab-1">…</button>        /* inferred: click strategy */
<input data-mg-id="search" />                /* inferred: focus strategy */
<figure data-mg-id="fig">…</figure>          /* inferred: figure kind   */

// Explicit overrides when semantics don't match:
<div data-mg-id="kpi"
     data-mg-kind="kpi"
     data-mg-strategy="hover"
     data-mg-dwell="1200">…</div>`;

export function QuickstartBlock() {
  return (
    <section className="site-quickstart" aria-labelledby="quickstart-title">
      <header className="site-quickstart__head">
        <div className="site-quickstart__kicker">Quickstart</div>
        <h2 id="quickstart-title" className="site-quickstart__title">
          Three files. <em>Three</em> minutes.
        </h2>
        <p className="site-quickstart__deck">
          Everything else is optional. The library ships its own CSS, its own
          types, and a strict peer dep on React ≥ 18. Theming is
          token-driven — override any <code>--mg-*</code> CSS custom
          property to match your brand.
        </p>
      </header>

      <div className="site-quickstart__steps">
        <QuickstartStep num="01" label="Install the package" code={INSTALL} />
        <QuickstartStep num="02" label="Wrap your app once" code={SETUP} />
        <QuickstartStep num="03" label="Mark anything, anywhere" code={USAGE} />
      </div>
    </section>
  );
}

function QuickstartStep({
  num,
  label,
  code,
}: {
  num: string;
  label: string;
  code: string;
}) {
  return (
    <article
      className="site-quickstart__step site-reveal"
      data-mg-id={`docs-step-${num}`}
      data-mg-kind="code"
    >
      <div className="site-quickstart__step-head">
        <span className="site-quickstart__step-num">{num}</span>
        <h3 className="site-quickstart__step-label">{label}</h3>
      </div>
      <pre className="site-quickstart__step-code">
        <code>{code}</code>
      </pre>
    </article>
  );
}
