<div align="center">

# 🧠 memory-graph

**Visualize how readers move through your content — as a living node-link graph.**

[![npm version](https://img.shields.io/npm/v/@myrkh/memory-graph?style=flat-square&color=6366f1&label=npm)](https://www.npmjs.com/package/@myrkh/memory-graph)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-5fa04e?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/tested_with-vitest-6e9f18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

<br />

> Every paragraph you read leaves a trace.  
> `memory-graph` turns that trace into a beautiful, interactive graph — tracking dwell time, reading paths, annotations, and the moments worth remembering.

<br />

[**Live Demo**](https://memory-graph-playground.vercel.app) · [**GitHub**](https://github.com/Myrkh/memory-graph) · [**Report a bug**](https://github.com/Myrkh/memory-graph/issues) · [**Request a feature**](https://github.com/Myrkh/memory-graph/issues)

</div>

---

## ✨ What it does

`memory-graph` is **ambient** — it follows the reader across your whole site, not just one article. As they scroll, it silently observes which paragraphs they actually spent time on, how they navigated back and forth, and where their attention concentrated most. All of this becomes a **node-link graph** available in a slide-out panel:

- 🔵 **Stations** — paragraphs where dwell time exceeded your threshold
- 🔘 **Passages** — paragraphs crossed below the threshold (optionally shown)
- ➡️ **Forward edges** — first-time transitions between stations
- 🔁 **Return edges** — revisits to already-read stations
- 🧭 **Route columns** — when the reader moves between pages, the graph switches to a 2D layout, one column per route (v0.2.0)
- 🔎 **Zoom controls** — floating satellite on the panel with focal-point zoom and blur escamotage (v0.2.0)
- 📊 **Intensity sparkline** — per-minute reading activity over the last hour
- 📌 **Pins & annotations** — highlight text, add notes, link annotations together
- 💾 **Persistence** — auto-saves to `localStorage`, with JSON export/import and **live cross-tab sync** on the same origin (v0.2.0)

---

## 🚀 Installation

```bash
npm install @myrkh/memory-graph
# or
pnpm add @myrkh/memory-graph
# or
yarn add @myrkh/memory-graph
```

**Peer dependencies:** React ≥ 18 and ReactDOM ≥ 18 must already be in your project.

---

## ⚡ Quick Start

### 1. Import the styles

```tsx
// In your entry file (e.g. main.tsx)
import '@myrkh/memory-graph/styles';

// Optional — built-in theme with sane defaults
import '@myrkh/memory-graph/themes/stit-claude';
```

### 2. Wrap your app once

`<MemoryGraph.Root>` is a **Provider**, the canonical pattern for stateful libs
(same idea as `<QueryClientProvider>` or Radix's `<TooltipProvider>`). Mount it
once at the root; mark the elements you want tracked anywhere inside with
`data-mg-id`.

```tsx
import { MemoryGraph } from '@myrkh/memory-graph';

export function App() {
  return (
    <MemoryGraph.Root storageKey="mg:my-app">
      <YourContent />

      {/* Panel + chrome singletons — mount once, anywhere below Root */}
      <MemoryGraph.Handle />
      <MemoryGraph.Panel>
        <MemoryGraph.Head>
          <MemoryGraph.TitleRow>
            <MemoryGraph.Title />
            <MemoryGraph.AnnotationsTrackToggle />
            <MemoryGraph.CloseButton />
          </MemoryGraph.TitleRow>
          <MemoryGraph.Stats />
          <MemoryGraph.DeepestIndicator />
        </MemoryGraph.Head>
        <GraphOrEmpty />
        <MemoryGraph.IntensitySparkline />
        <MemoryGraph.Footer>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.ClearButton />
            <MemoryGraph.ExportButton />
          </MemoryGraph.FooterGroup>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.PassagesToggle />
          </MemoryGraph.FooterGroup>
        </MemoryGraph.Footer>
      </MemoryGraph.Panel>

      <MemoryGraph.AnnotationsTrack />
      <MemoryGraph.Backdrop />
      <MemoryGraph.Tooltip />
      <MemoryGraph.PinToast />
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.LinkReveal />
      <MemoryGraph.KeyboardShortcuts />
    </MemoryGraph.Root>
  );
}

function GraphOrEmpty() {
  const { derived, showPassages, state } = useMemoryGraphContext();
  const hasContent =
    derived.stationCount > 0 || (showPassages && state.passages.size > 0);
  return hasContent ? <MemoryGraph.Graph /> : <MemoryGraph.Empty />;
}
```

### 3. Mark anything, anywhere

Any DOM element with `data-mg-id` is tracked. Zero wrapper required:

```tsx
<p data-mg-id="intro">Text that gets read…</p>            {/* viewport dwell  */}
<h2 data-mg-id="s1">Section title</h2>                    {/* auto: heading   */}
<button data-mg-id="tab-analytics">Analytics</button>     {/* auto: click     */}
<input data-mg-id="search" />                             {/* auto: focus     */}
<figure data-mg-id="fig-1"><img src="…" /></figure>       {/* auto: figure    */}
<div data-mg-id="kpi-revenue"                             {/* explicit: KPI   */}
     data-mg-kind="kpi"
     data-mg-strategy="hover"
     data-mg-dwell="1200">
  $42k
</div>
```

For content that needs pin/flash state plumbed to the DOM automatically, use
the optional `<MemoryGraph.Paragraph>` primitive — accepts rich JSX children
(nested `<em>`, `<code>`, `<ul>`…) and works with `as="aside" | "figure" | …`:

```tsx
<MemoryGraph.Paragraph as="aside" id="callout-1" className="callout">
  <strong>Tip:</strong> annotate any part of this aside — inline or whole-card.
</MemoryGraph.Paragraph>
```

### Optional: `<Zone>` for article-scoped tracking

When you want observation scoped to a specific subtree (e.g. one essay on a
larger page), wrap it in `<MemoryGraph.Zone>`. Without Zone, the tracker
observes `document.body` — which is exactly what you want for dashboards,
Chrome extensions, or single-article apps.

---

## 🧭 Multi-page tracking — the `route` dimension

Pass a `route` prop on `<Root>` to tell the graph which "bucket" the user is
currently in. Whatever the consumer wants — URL pathname, tab id, doc id,
feature flag. Agnostic of any routing library.

```tsx
<MemoryGraph.Root
  storageKey="mg:my-app"
  route={currentPathname}        // "/home", "/docs", "/pricing", …
  onPersistError={(err) => toast(`Couldn't save: ${err.message}`)}
>
  {/* Stays rendered across route changes — track across the whole site. */}
</MemoryGraph.Root>
```

When two or more unique routes accumulate in state, the `<Graph>`
automatically switches to a **2D column layout** — one column per route,
laid out chronologically in the order routes were first visited. Edges
crossing a route boundary get a distinct coral-dashed treatment
(`data-mg-route-jump`). Single-route graphs stay in the legacy single-column
mode.

The graph auto-follows the current route with a smooth horizontal scroll,
so navigating to a new page centers its column in the viewport.

---

## 🎨 Custom node shapes — `renderNode`

Give a specific tracked element its own SVG without polluting `NodeKind`
with site-specific values :

```tsx
<MemoryGraph.Graph
  renderNode={(item, ctx) =>
    item.id === 'ui-theme-toggle'
      ? <ThemeToggleNode r={ctx.r} />   /* your custom shape */
      : null                             /* fall back to default kind */
  }
/>
```

Pulse, pinned ring, highlight ring and order label stay library-managed —
the escape hatch only replaces the shape geometry.

---

## 🔎 Zoom controls

`<MemoryGraph.Graph>` ships a floating **zoom satellite** (in / out / fit)
anchored outside the panel's right edge in a hairline backdrop-blur pill.
Three Stit'Claude-signature icons: an aperture that contracts around a
magnifying node, satellites cascading outward, and chevrons clamping inward
on a coral diamond. Keyboard-complete, `prefers-reduced-motion`-safe.

- **Focal-point preservation** — the viewport center stays anchored at the
  same SVG coordinate through the transition
- **Blur escamotage** — a brief `blur(0) → blur(1.6px) → blur(0)` keyframe
  masks any perceptual jitter during the parallel scroll + dimension change
- Visibility gated by the panel open state so the satellite never lingers
  off-screen; mobile fallback pulls it back inside on narrow viewports

---

## 🔄 Intertab sync

Multiple tabs open on the same origin stay in sync automatically via the
browser's native `storage` event. Any write from one tab is picked up by
every other tab of the same origin and rehydrates into the reducer — no
`BroadcastChannel`, no sync server, no dependency. The write effect has a
built-in guard that skips redundant writes, so the cross-tab echo loop is
broken cleanly with zero config.

---

## 🎛️ Multi-strategy capture

| strategy | when it fires | inferred from |
|---|---|---|
| `viewport` (default) | element centered in attention band for `DWELL_MS` | `<p>`, `<div>`, everything else |
| `click` | element is clicked (synthetic dwell = `DWELL_MS`) | `<button>`, `<a>`, `[role="button"\|"link"\|"tab"]` |
| `focus` | keyboard focus rests for `data-mg-dwell` ms | `<input>`, `<textarea>`, `<select>`, `[contenteditable]` |
| `hover` | pointer rests for `data-mg-dwell` ms | explicit only |

Override per element with `data-mg-strategy="…"`, or disable inference globally
with `strategyInference: 'explicit'` on the tracker. Semantic HTML signals
intent — the library just reads it.

Hover, click and focus commit with `DWELL_MS` synthetic dwell, so they always
promote to stations — intent gestures are not passages. Only viewport is
dwell-dominated.

---

## 🔷 Node kinds (graph geometry)

| kind | shape | inferred from |
|---|---|---|
| `paragraph` (default) | circle | `<p>`, everything else |
| `heading` | concentric ring | `<h1>`–`<h6>`, `[role="heading"]` |
| `figure` | diamond | `<figure>`, `<img>`, `<picture>`, `<video>` |
| `code` | rounded square | `<pre>`, standalone block `<code>` |
| `kpi` | square | **explicit only** (`data-mg-kind="kpi"`) |

Every existing effect (pulse on centered, pinned ring, hover ring, chain
highlighting, order label) works consistently across every kind — `<NodeRing>`
mirrors the shape geometry so the coral signature reads as one voice on a
square or a diamond as much as on a circle.

---

## ✍️ Annotations (uniform across every element)

Select text anywhere below `<MemoryGraph.Root>` and the floating toolbar opens:
Note, Pin, Link. Two scopes, auto-detected:

- **Text scope** — partial selection → inline coral `<mark>` on the selected
  range. Nested markup (`<code>`, `<em>`…) is handled by a TreeWalker that
  emits one mark per text chunk, all sharing the same
  `data-mg-annotation-id` so hover / link / flash behave as one.
- **Block scope** — selection covering the full element (Cmd+A, triple-click,
  drag entire block) → `data-mg-annotated="block"` on the element itself,
  styled as a coral left stripe + subtle tint. Same visual grammar, card-level.

Works the same in `<p>`, `<aside>`, `<figure>`, `<blockquote>`, raw `<div>` — no
primitive wrapper required. SVG text gracefully skips inline wrapping (HTML
`<mark>` can't live inside the SVG namespace); block-scope annotations on
the enclosing `<figure>` always work.

---

## 🧩 Primitives

`memory-graph` is built as a **compound component system** — every primitive is independently composable, so you get full control over layout and design without fighting the library.

| Primitive | Description |
|---|---|
| `MemoryGraph.Root` | Context owner. Manages all state, wires hooks, provides context to descendants. |
| `MemoryGraph.Zone` | Wraps your readable content. Observes `[data-mg-id]` descendants. |
| `MemoryGraph.Paragraph` | Thin semantic wrapper — stamps `data-mg-*` attributes + plumbs pin/flash state. Accepts rich JSX children (nested `<em>`, `<code>`, lists). Optional; a raw `<p data-mg-id>` works just as well — annotation rendering is owned by `<Zone>`. |
| `MemoryGraph.Handle` | Floating left-edge button that opens the panel. Carries `data-mg-armed` when ≥ 1 station exists. Variants: `permanent` · `ghost` · `none`. |
| `MemoryGraph.Panel` | The slide-out graph panel container. |
| `MemoryGraph.Head` | Panel header slot. |
| `MemoryGraph.TitleRow` | Horizontal row inside the head — title on the left, controls on the right. |
| `MemoryGraph.Title` | Renders the panel title (default `Memory <em>Graph</em>`). |
| `MemoryGraph.CloseButton` | Closes the panel. |
| `MemoryGraph.Stats` | Four-metric grid — stations · loops · total time · pins. |
| `MemoryGraph.DeepestIndicator` | Shows the paragraph with the highest cumulative dwell time. |
| `MemoryGraph.Empty` | Placeholder for when no station exists yet. Render conditionally — the library does not swap automatically. |
| `MemoryGraph.Graph` | The SVG graph: stations, passages, edges, minute axis, annotation satellites and link arcs. Clicking a node scrolls to its paragraph. |
| `MemoryGraph.IntensitySparkline` | Bar chart of per-minute reading intensity (last 60 min). |
| `MemoryGraph.Footer` / `FooterGroup` | Panel footer layout slots. |
| `MemoryGraph.ClearButton` | Clears all graph data from state and localStorage. |
| `MemoryGraph.ExportButton` | Exports the current graph + annotations as JSON. |
| `MemoryGraph.PassagesToggle` | Button to show/hide passage dots. |
| `MemoryGraph.AnnotationsTrack` | Side column listing annotations git-graph style. **Sibling of Panel, not child.** |
| `MemoryGraph.AnnotationsTrackToggle` | Button (typically in the head) to show/hide the track. |
| `MemoryGraph.SelectionToolbar` | Floating toolbar shown on qualifying text selection — Note · Pin · Link. |
| `MemoryGraph.NoteEditor` | Inline markdown-lite editor. Rendered internally by `SelectionToolbar`; exposed for consumers building a custom toolbar. |
| `MemoryGraph.LinkReveal` | Overlay that draws an arc between a hovered annotation and its on-screen link targets. |
| `MemoryGraph.Tooltip` | Hover tooltip for graph nodes and satellites (extract + stats or note). |
| `MemoryGraph.Backdrop` | Full-screen overlay behind the open panel. |
| `MemoryGraph.PinToast` | Transient toast pill (used for pin confirmation and linking hints). |
| `MemoryGraph.KeyboardShortcuts` | Installs the global shortcut handler. Renders nothing. |

---

## 🪝 Hooks

For advanced use-cases, all core logic is available as standalone hooks.

```tsx
import {
  // Core state + persistence
  useMemoryGraphState,
  usePersistence,
  useMemoryGraphContext,
  // Tracking — composer + per-strategy hooks
  useAttentionTracker,
  useViewportStrategy,
  useHoverStrategy,
  useClickStrategy,
  useFocusStrategy,
  // Hover + selection
  useMemoryGraphHover,
  useTextSelection,
  useFocusTrap,
  // Inference helpers
  inferStrategy,
  resolveStrategy,
  inferKind,
  resolveKind,
} from '@myrkh/memory-graph';
```

### `useMemoryGraphState(config)`

The central state machine. Returns the graph state, derived metrics, and all actions.

```tsx
const { state, actions, derived, showPassages, previousStationId } =
  useMemoryGraphState(config);

// derived.stationCount  — number of stations
// derived.loopCount     — number of return edges
// derived.totalMs       — cumulative dwell time across all stations
// derived.pinCount      — pinned station count
// derived.deepest       — { id, node } of the most-dwelled station
```

### `useAttentionTracker(container, options)`

Composes the four capture strategies (viewport · hover · click · focus) and
routes every `[data-mg-id]` to the right observer based on its
`data-mg-strategy` attribute (or smart inference). All strategies converge on
`onCommit(paraId, dwellMs, textContent, kind?)`.

```tsx
const { currentParaId } = useAttentionTracker(zoneElement, {
  config,
  onCommit: actions.commit,
  strategyInference: 'smart',   // default
  kindInference: 'smart',       // default
  hoverDwellMs: 1500,
  focusDwellMs: 1500,
});
```

Takes a live `HTMLElement | null` (not a ref) so observers re-run when the
zone mounts / unmounts. When `container` is `null`, falls back to
`document.body` — enables zero-Zone dashboards and Chrome extensions.

Use the per-strategy hooks directly (`useViewportStrategy`, `useHoverStrategy`,
`useClickStrategy`, `useFocusStrategy`) when you need finer control — e.g.
viewport-only tracking without click side-effects.

### `usePersistence(state, storageKey, restore, onPersistError?)`

Auto-saves the graph to `localStorage` on every state change, rehydrates on
mount, **syncs across tabs of the same origin via the native `storage` event**,
and provides JSON export/restore. Fourth arg is an optional callback invoked
when `setItem` fails (quota exceeded, private mode, disabled storage).

```tsx
const { exportJson, clearPersisted } = usePersistence(
  state,
  'mg:my-article',
  actions.restore,
  (err) => toast(`Couldn't save: ${err.message}`),
);
```

### `useTextSelection(options)`

Detects and resolves text selections inside the reading zone, with paragraph-level offset information — used internally by `SelectionToolbar`.

### `useMemoryGraphHover()`

Provides bidirectional hover state between graph nodes and paragraphs in the zone.

```tsx
const { hoveredNodeId, setHoveredNode } = useMemoryGraphHover();
```

### `useMemoryGraphContext()`

Access the full root context. Use this when you're composing your own primitives
(custom footer button, bespoke annotation row, debug overlay) — it gives you
direct access to every piece of state the library manages: `state`, `derived`,
`actions`, `open`, `hoveredNodeId`, `hoveredAnnotationId`, `linkingMode`,
`trackOpen`, and the imperative setters for each. Must be called inside a
`<MemoryGraph.Root>` tree, otherwise it throws.

```tsx
function MyCustomButton() {
  const { open, openPanel, derived } = useMemoryGraphContext();
  return (
    <button onClick={openPanel} disabled={derived.stationCount === 0}>
      {open ? 'Reading' : `Open graph · ${derived.stationCount} stations`}
    </button>
  );
}
```

---

## ⚙️ Configuration

Pass a partial config object to `MemoryGraph.Root` to override any default:

```tsx
<MemoryGraph.Root
  storageKey="mg:my-article"
  config={{
    DWELL_MS: 5000,    // ms before a paragraph becomes a station (default: 3000)
    BAND_RATIO: 0.35,  // fraction of viewport used as detection band (default: 0.4)
  }}
>
```

All available options:

| Key | Default | Description |
|---|---|---|
| `DWELL_MS` | `3000` | Minimum dwell time (ms) to promote a paragraph to a station |
| `BAND_RATIO` | `0.4` | Viewport fraction for the "centered" detection band (0–1) |
| `GRAPH_PADDING_TOP` | `40` | Top padding inside the SVG viewport |
| `GRAPH_PADDING_BOTTOM` | `40` | Bottom padding inside the SVG viewport |
| `GRAPH_PADDING_X` | `40` | Horizontal padding inside the SVG viewport |
| `MIN_NODE_SEPARATION_Y` | `34` | Minimum vertical spacing between consecutive nodes |
| `CENTER_X_RATIO` | `0.5` | Horizontal center of the graph (fraction of SVG width) |
| `NODE_OFFSET_X` | `28` | Alternating left/right offset from center for adjacent nodes |
| `RETURN_BEND` | `70` | Bézier bend distance for return edges |
| `NODE_R_MIN` | `5` | Minimum station disc radius |
| `NODE_R_MAX` | `14` | Maximum station disc radius (at the deepest node) |
| `PASSAGE_R` | `3.5` | Fixed radius for passage dots |

---

## 🎨 Theming

`memory-graph` is styled with CSS custom properties. Every visual decision in
the library reads a `--mg-*` token. You can import the built-in theme as a
starting point and override any token:

```css
@import '@myrkh/memory-graph/themes/stit-claude';

/* Override the tokens you want at the canonical theme selector */
[data-mg-theme='stit-claude'] {
  --mg-accent: oklch(0.62 0.19 250);        /* swap the coral for an indigo */
  --mg-bg: #0f172a;                          /* force a dark surface */
  --mg-font-display: 'Playfair Display', serif;
  --mg-duration-normal: 240ms;
}
```

The shipped token contract:

- **Palette** — `--mg-bg`, `--mg-surface`, `--mg-border`, `--mg-fg`, `--mg-fg-muted`, `--mg-fg-subtle`, `--mg-accent`, `--mg-accent-hover`, `--mg-accent-subtle`, `--mg-ring`
- **Fonts** — `--mg-font-display`, `--mg-font-serif`, `--mg-font-sans`, `--mg-font-mono`
- **Motion** — `--mg-duration-{fast,normal,moderate,slow}`, `--mg-ease-{standard,decelerate,expo-out,spring-smooth,spring-snappy}`
- **Radii** — `--mg-radius-{sm,md,lg,pill}`

Or skip the built-in theme entirely — the base stylesheet alone ships neutral
defaults at `:where(:root)` (zero specificity) so the component renders
correctly with no theme file loaded:

```tsx
import '@myrkh/memory-graph/styles'; // base layout only, no opinionated palette
```

---

## ⌨️ Keyboard Shortcuts

When `<MemoryGraph.KeyboardShortcuts />` is mounted:

| Shortcut | Action |
|---|---|
| `⌘M` / `Ctrl+M` | Toggle the graph panel |
| `P` | Toggle pin on the currently centered paragraph |
| `Escape` | Close the panel / cancel linking mode |

Shortcuts are suspended while an input, textarea, or the note editor has focus —
typing `P` inside a note writes the letter, it does not pin.

---

## 📐 Controlled Panel

The panel open state can be controlled externally:

```tsx
const [open, setOpen] = useState(false);

<MemoryGraph.Root
  storageKey="mg:essay"
  open={open}
  onOpenChange={setOpen}
>
```

Or use the uncontrolled `defaultOpen` prop for a simple initial state.

---

## 🗃️ Data Model

The library tracks three kinds of reading events:

```
Node (Station)     — paragraph read for ≥ DWELL_MS
  ├─ order         — stable insertion index
  ├─ firstAt       — epoch ms of first promotion
  ├─ totalMs       — cumulative dwell time
  ├─ visits        — distinct visit count
  ├─ pinned        — user-pinned flag
  └─ extract       — short text excerpt

Passage            — paragraph below dwell threshold
  ├─ firstAt
  └─ extract

Edge               — transition between two stations
  ├─ from / to     — ParagraphId references
  ├─ kind          — "forward" | "return"
  └─ at            — epoch ms

Annotation         — pinned text selection with optional note
  ├─ paraId        — host paragraph
  ├─ selection     — text range offsets
  ├─ note          — markdown-lite string
  └─ links         — bidirectional links to other annotations
```

The full graph is serializable as JSON via `ExportButton` or `usePersistence`.

---

## 📦 Repository Structure

```
memory-graph/
├── packages/
│   ├── core/          # @myrkh/memory-graph — the library
│   │   ├── src/
│   │   │   ├── hooks/        # useMemoryGraphState, useAttentionTracker, …
│   │   │   ├── internal/     # reducer, graph layout, SVG rendering, …
│   │   │   ├── primitives/   # compound components
│   │   │   └── styles/       # base CSS + themes
│   │   └── package.json
│   └── playground/    # dev sandbox (Vite + React)
└── package.json       # pnpm workspace root
```

---

## 🛠️ Development

**Prerequisites:** Node ≥ 20, pnpm ≥ 10

```bash
git clone https://github.com/Myrkh/memory-graph.git
cd memory-graph
pnpm install

# Start the playground dev server
pnpm dev

# Build the library
pnpm build

# Run tests
pnpm --filter @myrkh/memory-graph test

# Type-check all packages
pnpm typecheck
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, or jump straight to a pull request for small fixes.

1. Fork the repository
2. Create your branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](./LICENSE) — © [Myrkh](https://github.com/Myrkh)

---

<div align="center">

Made with ☕ and curiosity about how people actually read things.

**[⬆ Back to top](#-memory-graph)**

</div>