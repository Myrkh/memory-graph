# @myrkh/memory-graph

[![npm](https://img.shields.io/npm/v/@myrkh/memory-graph?style=flat-square&color=ee624e)](https://www.npmjs.com/package/@myrkh/memory-graph)
[![license](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](./LICENSE)
[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019-61dafb?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)](https://www.typescriptlang.org/)

**Visualize reading attention as a living node-link graph.** Drop it into any React app, mark the elements you want tracked, and watch a graph materialize behind a slide-out panel — stations, passages, edges, annotations, the whole reading trail.

Multi-DOM. Multi-strategy. Smart defaults. Token-only styling. Zero network.

## Install

```bash
npm i @myrkh/memory-graph
# or
pnpm add @myrkh/memory-graph
```

Peer deps: `react >= 18`, `react-dom >= 18`.

## Quick start

**Wrap your app once** — `<MemoryGraph.Root>` is a Provider, the canonical pattern for stateful libs (same idea as `<QueryClientProvider>`, `<TooltipProvider>`). Mark the elements you want tracked with `data-mg-id`, anywhere in the tree.

```tsx
import '@myrkh/memory-graph/styles';
import '@myrkh/memory-graph/themes/stit-claude'; // optional theme
import { MemoryGraph } from '@myrkh/memory-graph';

export function App() {
  return (
    <MemoryGraph.Root storageKey="mg:my-app">
      <YourContent />

      {/* Panel + all chrome singletons — mount once */}
      <MemoryGraph.Handle />
      <MemoryGraph.Panel>{/* … head, stats, graph, footer */}</MemoryGraph.Panel>
      <MemoryGraph.Backdrop />
      <MemoryGraph.Tooltip />
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.KeyboardShortcuts />
    </MemoryGraph.Root>
  );
}
```

Then anywhere inside, on any DOM element:

```tsx
<p data-mg-id="intro">…</p>                       {/* viewport dwell (default) */}
<h2 data-mg-id="s1">…</h2>                        {/* auto-inferred: heading kind */}
<button data-mg-id="tab1">…</button>              {/* auto: click strategy */}
<input data-mg-id="query" />                      {/* auto: focus strategy */}
<div data-mg-id="kpi1" data-mg-kind="kpi"         {/* explicit KPI square */}
     data-mg-strategy="hover" data-mg-dwell="1200">…</div>
<figure data-mg-id="fig1">…</figure>              {/* auto: figure diamond */}
```

Every `[data-mg-id]` gets uniform behavior: tracked, annotatable (partial selection → inline mark, full selection → block treatment), hover-linked, flash-reachable, persistable.

## Multi-page tracking — the `route` dimension

Pass a `route` prop on `<Root>` to tell the graph which "bucket" the user is currently in. Whatever the consumer wants — URL pathname, tab id, doc id, feature flag. Agnostic of any routing library.

```tsx
<MemoryGraph.Root
  storageKey="mg:my-app"
  route={currentPathname}        // "/home", "/docs", "/pricing", …
  onPersistError={(err) => toast(`Couldn't save: ${err.message}`)}
>
  {/* Stays rendered across route changes — track across the whole site. */}
</MemoryGraph.Root>
```

When two or more unique routes accumulate in state, the `<Graph>` automatically switches to a **2D column layout** — one column per route, laid out chronologically in the order routes were first visited. Edges crossing a route boundary get a distinct coral-dashed treatment (`data-mg-route-jump`). Single-route graphs stay in the legacy single-column mode.

The graph auto-follows your current route with a smooth horizontal scroll, so navigating to a new page centers its column in the viewport.

## Custom node shapes — `renderNode`

Give a specific tracked element its own SVG without polluting `NodeKind` with site-specific values :

```tsx
<MemoryGraph.Graph
  renderNode={(item, ctx) =>
    item.id === 'ui-theme-toggle'
      ? <ThemeToggleNode r={ctx.r} />   /* your custom shape */
      : null                             /* fall back to default kind */
  }
/>
```

Pulse, pinned ring, highlight ring and order label stay library-managed — the escape hatch only replaces the shape geometry.

## Zoom controls

`<MemoryGraph.Graph>` ships a floating zoom satellite (in / out / fit) anchored to the panel's right edge. Focal-point preservation keeps the viewport center anchored through the transition; a brief blur masks any perceptual jitter. Visibility is gated by the panel open state, so the controls never linger off-screen.

## Intertab sync

Multiple tabs open on the same origin stay in sync automatically via the browser's native `storage` event. Any write from one tab is picked up by every other tab of the same origin and rehydrates into the reducer — no BroadcastChannel, no sync server, no dependency. Zero config.

## Four capture strategies

| strategy | when it fires | inferred from |
|---|---|---|
| `viewport` (default) | element centered in attention band for `DWELL_MS` | `<p>`, `<div>`, everything else |
| `click` | element is clicked | `<button>`, `<a>`, `[role="button"\|"link"\|"tab"]` |
| `focus` | keyboard focus rests for `data-mg-dwell` ms | `<input>`, `<textarea>`, `<select>` |
| `hover` | pointer rests for `data-mg-dwell` ms | explicit only — no tag maps to hover |

Override with `data-mg-strategy="…"` per element, or disable smart inference globally with `strategyInference: 'explicit'` on the tracker.

## Five node kinds

| kind | shape | inferred from |
|---|---|---|
| `paragraph` (default) | circle | `<p>`, rest |
| `heading` | concentric ring | `<h1>`–`<h6>`, `[role="heading"]` |
| `figure` | diamond | `<figure>`, `<img>`, `<picture>`, `<video>` |
| `code` | rounded square | `<pre>`, standalone `<code>` |
| `kpi` | square | **explicit only** (`data-mg-kind="kpi"`) |

## Annotations, uniform

Select text inside any `[data-mg-id]` → toolbar opens → Note, Pin, or Link. Selections that cover the whole element become **block-scope** annotations (card-level treatment); partial selections become inline `<mark>` underlines. Same behavior in `<p>`, `<aside>`, `<figure>`, `<blockquote>` — zero primitive wrapping required.

## Keyboard shortcuts

When `<MemoryGraph.KeyboardShortcuts />` is mounted:

- `⌘M` / `Ctrl+M` — toggle the panel
- `P` — toggle pin on the currently centered paragraph
- `Escape` — close panel / cancel linking mode

## Philosophy

Five non-negotiable laws, straight from the original vanilla component:

1. **Zero network.** Everything lives in `localStorage`.
2. **Passive observation.** Watch silently, respond only to explicit gestures.
3. **Temporal topology only.** Y axis = `firstAt`. Never force-directed.
4. **Return-edges curve right.** Cubic Bézier, non-negotiable signature.
5. **Three-second dwell.** Below the threshold, it's a passage, not a station.

## Docs

Full documentation, live demo, and source at **[github.com/Myrkh/memory-graph](https://github.com/Myrkh/memory-graph)**.

## License

[MIT](./LICENSE) — © Yoann Dumont
