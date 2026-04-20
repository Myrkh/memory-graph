interface ApiRow {
  name: string;
  kind: string;
  note: string;
}

const PRIMITIVES: ApiRow[] = [
  { name: 'Root', kind: 'provider', note: 'Wraps your app. Owns state, context, persistence.' },
  { name: 'Zone', kind: 'optional', note: 'Article-scoped tracking. Falls back to document.body without it.' },
  { name: 'Paragraph', kind: 'primitive', note: 'Thin semantic wrapper. Stamps data-mg-* attrs, plumbs pin/flash.' },
  { name: 'Handle', kind: 'primitive', note: 'Floating left-edge button. Variants: permanent | ghost | none.' },
  { name: 'Panel', kind: 'primitive', note: 'Slide-out panel container with focus trap + a11y.' },
  { name: 'Graph', kind: 'primitive', note: 'The SVG graph. Stations, edges, satellites, link arcs.' },
  { name: 'SelectionToolbar', kind: 'primitive', note: 'Floating toolbar on text selection. Note · Pin · Link.' },
  { name: 'AnnotationsTrack', kind: 'primitive', note: 'Side column listing annotations, git-graph style.' },
  { name: 'KeyboardShortcuts', kind: 'primitive', note: '⌘M toggle, P pin, Escape close. Renders nothing.' },
];

const HOOKS: ApiRow[] = [
  { name: 'useMemoryGraphState', kind: 'state', note: 'Core reducer. Returns { state, actions, derived }.' },
  { name: 'usePersistence', kind: 'storage', note: 'Auto-save to localStorage. JSON export / import.' },
  { name: 'useAttentionTracker', kind: 'tracker', note: 'Composer over the four capture strategies.' },
  { name: 'useViewportStrategy', kind: 'tracker', note: 'IntersectionObserver + dwell for reading mode.' },
  { name: 'useHoverStrategy', kind: 'tracker', note: 'Pointer dwell on element, delegation-based.' },
  { name: 'useClickStrategy', kind: 'tracker', note: 'Commits on click with synthetic dwell.' },
  { name: 'useFocusStrategy', kind: 'tracker', note: 'Keyboard focus dwell via focusin/focusout.' },
  { name: 'useTextSelection', kind: 'selection', note: 'Resolves Range to paragraph-scoped offsets.' },
  { name: 'useMemoryGraphContext', kind: 'escape hatch', note: 'Full context access for custom primitives.' },
];

const ATTRS: ApiRow[] = [
  { name: 'data-mg-id', kind: 'required', note: 'Unique identifier. Marks the element as trackable.' },
  { name: 'data-mg-strategy', kind: 'optional', note: 'viewport | hover | click | focus. Default: inferred.' },
  { name: 'data-mg-kind', kind: 'optional', note: 'paragraph | heading | kpi | figure | code. Default: inferred.' },
  { name: 'data-mg-dwell', kind: 'optional', note: 'Per-element dwell threshold in ms. Hover/focus only.' },
];

export function ApiTable() {
  return (
    <section className="site-api" aria-labelledby="api-title">
      <header className="site-api__head">
        <div className="site-api__kicker">Reference</div>
        <h2 id="api-title" className="site-api__title">
          <em>Everything</em> exported, at a glance.
        </h2>
        <p className="site-api__deck">
          Typed strict. Tree-shakable. Every export is intentional — no
          barrel-file fog. Full inline JSDoc in your editor.
        </p>
      </header>

      <ApiGroup id="api-attrs" title="DOM attributes" kicker="author-set" rows={ATTRS} />
      <ApiGroup id="api-primitives" title="Primitives · compound components" kicker="JSX" rows={PRIMITIVES} />
      <ApiGroup id="api-hooks" title="Hooks · headless logic" kicker="React" rows={HOOKS} />
    </section>
  );
}

function ApiGroup({
  id,
  title,
  kicker,
  rows,
}: {
  id: string;
  title: string;
  kicker: string;
  rows: ApiRow[];
}) {
  return (
    <div className="site-api__group site-reveal" data-mg-id={`docs-${id}`}>
      <header className="site-api__group-head">
        <span className="site-api__group-kicker">{kicker}</span>
        <h3 className="site-api__group-title">{title}</h3>
      </header>
      <div className="site-api__table">
        {rows.map((r) => (
          <div key={r.name} className="site-api__row">
            <code className="site-api__row-name">{r.name}</code>
            <span className="site-api__row-kind">{r.kind}</span>
            <span className="site-api__row-note">{r.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
