export interface DemoIntroProps {
  variant: 'permanent' | 'ghost' | 'none';
  onVariantChange: (variant: 'permanent' | 'ghost' | 'none') => void;
}

const VARIANTS: { value: DemoIntroProps['variant']; label: string; sub: string }[] = [
  { value: 'permanent', label: 'Permanent', sub: 'default · armed at rest' },
  { value: 'ghost', label: 'Ghost', sub: 'hover left edge to reveal' },
  { value: 'none', label: 'Keyboard', sub: 'none handle · ⌘M or custom trigger' },
];

export function DemoIntro({ variant, onVariantChange }: DemoIntroProps) {
  return (
    <section className="site-demo-intro" aria-labelledby="demo-title">
      <div className="site-demo-intro__kicker">Live · try it below</div>

      <h1 id="demo-title" className="site-demo-intro__title">
        An essay wired to the <em>library</em>.
      </h1>

      <p className="site-demo-intro__deck">
        Below is a real long-form essay, every block observed by memory-graph.
        Scroll, read, linger. Open the panel and watch the graph form —
        stations appear for paragraphs you lingered on, passages for ones you
        crossed, edges for the path between them.
      </p>

      <div className="site-demo-intro__variants" role="radiogroup" aria-label="Handle variant">
        <span className="site-demo-intro__variants-kicker">Handle variant</span>
        <div className="site-demo-intro__variants-row">
          {VARIANTS.map((v) => {
            const active = v.value === variant;
            return (
              <button
                key={v.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onVariantChange(v.value)}
                className={
                  active
                    ? 'site-demo-intro__variant site-demo-intro__variant--active'
                    : 'site-demo-intro__variant'
                }
              >
                <span className="site-demo-intro__variant-label">{v.label}</span>
                <span className="site-demo-intro__variant-sub">{v.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="site-demo-intro__hint" aria-hidden>
        <span>scroll to read</span>
        <span className="site-demo-intro__hint-arrow">↓</span>
      </div>
    </section>
  );
}
