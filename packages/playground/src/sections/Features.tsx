import { useEffect, useRef, type CSSProperties } from 'react';

interface Feature {
  num: string;
  title: string;
  tagline: string;
  body: string;
  sample: string;
}

const FEATURES: Feature[] = [
  {
    num: '01',
    title: 'Multi-DOM tracking',
    tagline: 'Any block. Any markup.',
    body:
      'Every element carrying data-mg-id becomes a node. Paragraphs, headings, figures, callouts, buttons, inputs, KPIs — no wrapper required.',
    sample: '<p data-mg-id="intro">…</p>',
  },
  {
    num: '02',
    title: 'Four capture strategies',
    tagline: 'Viewport · hover · click · focus.',
    body:
      'Reading mode for text. Cursor dwell for cards. Click for tabs. Focus for inputs. Each gesture routed to the right observer via semantic HTML.',
    sample: 'data-mg-strategy="hover"',
  },
  {
    num: '03',
    title: 'Five node kinds',
    tagline: 'Geometry that tells.',
    body:
      'Circle for paragraphs. Concentric ring for headings. Square for KPIs. Diamond for figures. Rounded square for code. The graph describes what it tracks.',
    sample: 'data-mg-kind="kpi"',
  },
  {
    num: '04',
    title: 'Smart inference',
    tagline: 'Semantic HTML is the hint.',
    body:
      '<button> is click. <input> is focus. <h1> is heading. <figure> is figure. Zero attributes for the common case; override per-element when you need precision.',
    sample: "strategyInference: 'smart'",
  },
  {
    num: '05',
    title: 'Uniform annotations',
    tagline: 'Text and block, one grammar.',
    body:
      'Select a word → coral underline. Select a whole card → coral left stripe. Every data-mg-id behaves identically — no primitive wrapping required.',
    sample: 'scope: "text" | "block"',
  },
  {
    num: '06',
    title: 'Zero network',
    tagline: 'Your device, your data.',
    body:
      'Everything lives in localStorage. No telemetry. No analytics. No third-party sync. Export as JSON whenever you want; import it back the same way.',
    sample: "storageKey: 'mg:my-app'",
  },
];

/**
 * Cursor-spotlight on feature cards. One `pointermove` listener on the
 * grid, delegated by `closest`. Sets `--mx` / `--my` CSS custom properties
 * on the hovered card in pixels; CSS consumes them via a radial-gradient
 * that follows the cursor. No per-card listener, no re-renders, no React
 * state — the effect is pure CSS driven by live custom properties.
 */
function useGridSpotlight() {
  const ref = useRef<HTMLUListElement | null>(null);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const onMove = (e: PointerEvent): void => {
      if (!(e.target instanceof Element)) return;
      const card = e.target.closest<HTMLElement>('.site-features__card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    grid.addEventListener('pointermove', onMove);
    return () => grid.removeEventListener('pointermove', onMove);
  }, []);
  return ref;
}

export function Features() {
  const gridRef = useGridSpotlight();

  return (
    <section className="site-features" aria-labelledby="features-title">
      <header className="site-features__head">
        <div className="site-features__kicker">What you get</div>
        <h2 id="features-title" className="site-features__title">
          Small API. <em>Wide</em> reach.
        </h2>
        <p className="site-features__deck">
          Four capture strategies. Five node kinds. One cohesive visual
          grammar. Everything is token-driven, typed strict, and ships with
          its own CSS — drop it in and it works.
        </p>
      </header>

      <ul className="site-features__grid" ref={gridRef}>
        {FEATURES.map((f, i) => (
          <li
            key={f.num}
            className="site-features__card site-reveal"
            data-mg-id={`home-feat-${f.num}`}
            data-mg-kind="kpi"
            style={{ '--site-reveal-delay': `${i * 60}ms` } as CSSProperties}
          >
            <div className="site-features__card-head">
              <span className="site-features__card-num">{f.num}</span>
              <h3 className="site-features__card-title">{f.title}</h3>
            </div>
            <p className="site-features__card-tagline">{f.tagline}</p>
            <p className="site-features__card-body">{f.body}</p>
            <code className="site-features__card-sample">{f.sample}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
