<div align="center">

# 🧠 memory-graph

**Visualize how readers move through your content — as a living node-link graph.**

[![npm version](https://img.shields.io/npm/v/@stitclaude/memory-graph?style=flat-square&color=6366f1&label=npm)](https://www.npmjs.com/package/@stitclaude/memory-graph)
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

[**Live Demo**](https://github.com/Myrkh/memory-graph) · [**GitHub**](https://github.com/Myrkh/memory-graph) · [**Report a bug**](https://github.com/Myrkh/memory-graph/issues) · [**Request a feature**](https://github.com/Myrkh/memory-graph/issues)

</div>

---

## ✨ What it does

As a reader scrolls through your content, `memory-graph` silently observes them — detecting which paragraphs they actually spent time on, how they navigated back and forth, and where their attention concentrated most. All of this becomes a **node-link graph**, available in a slide-out panel:

- 🔵 **Stations** — paragraphs where dwell time exceeded your threshold
- 🔘 **Passages** — paragraphs crossed below the threshold (optionally shown)
- ➡️ **Forward edges** — first-time transitions between stations
- 🔁 **Return edges** — revisits to already-read stations
- 📊 **Intensity sparkline** — per-minute reading activity over the last hour
- 📌 **Pins & annotations** — highlight text, add notes, link annotations together
- 💾 **Persistence** — everything auto-saves to `localStorage`, with JSON export/import

---

## 🚀 Installation

```bash
npm install @stitclaude/memory-graph
# or
pnpm add @stitclaude/memory-graph
# or
yarn add @stitclaude/memory-graph
```

**Peer dependencies:** React ≥ 18 and ReactDOM ≥ 18 must already be in your project.

---

## ⚡ Quick Start

### 1. Import the styles

```tsx
// In your entry file (e.g. main.tsx)
import '@stitclaude/memory-graph/styles';

// Optional — built-in theme with sane defaults
import '@stitclaude/memory-graph/themes/stit-claude';
```

### 2. Wrap your content

```tsx
import { MemoryGraph } from '@stitclaude/memory-graph';

export function Article() {
  return (
    <MemoryGraph.Root storageKey="mg:my-article">

      {/* The reading zone — paragraphs must have data-mg-id */}
      <MemoryGraph.Zone>
        <MemoryGraph.Paragraph id="intro">
          <p>Introduction...</p>
        </MemoryGraph.Paragraph>
        <MemoryGraph.Paragraph id="section-1">
          <p>First section...</p>
        </MemoryGraph.Paragraph>
        {/* ...more paragraphs */}
      </MemoryGraph.Zone>

      {/* Floating button to open the panel */}
      <MemoryGraph.Handle />

      {/* The slide-out panel with the graph */}
      <MemoryGraph.Panel>
        <MemoryGraph.Head>
          <MemoryGraph.TitleRow>
            <MemoryGraph.Title />
            <MemoryGraph.CloseButton />
          </MemoryGraph.TitleRow>
          <MemoryGraph.Stats />
          <MemoryGraph.DeepestIndicator />
        </MemoryGraph.Head>
        <MemoryGraph.Graph />
        <MemoryGraph.Empty />
        <MemoryGraph.Footer>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.PassagesToggle />
            <MemoryGraph.AnnotationsTrackToggle />
          </MemoryGraph.FooterGroup>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.ExportButton />
            <MemoryGraph.ClearButton />
          </MemoryGraph.FooterGroup>
        </MemoryGraph.Footer>
        <MemoryGraph.AnnotationsTrack />
      </MemoryGraph.Panel>

      <MemoryGraph.Backdrop />
      <MemoryGraph.Tooltip />
      <MemoryGraph.PinToast />
      <MemoryGraph.KeyboardShortcuts />
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.LinkReveal />

    </MemoryGraph.Root>
  );
}
```

---

## 🧩 Primitives

`memory-graph` is built as a **compound component system** — every primitive is independently composable, so you get full control over layout and design without fighting the library.

| Primitive | Description |
|---|---|
| `MemoryGraph.Root` | Context owner. Manages all state, wires hooks, provides context to descendants. |
| `MemoryGraph.Zone` | Wraps your readable content. Observes `[data-mg-id]` descendants. |
| `MemoryGraph.Paragraph` | Convenience wrapper that applies `data-mg-id` to its child. |
| `MemoryGraph.Handle` | Floating button to open the panel. Shows current station count. |
| `MemoryGraph.Panel` | The slide-out graph panel container. |
| `MemoryGraph.Head` | Panel header slot. |
| `MemoryGraph.Title` | Renders the panel title. |
| `MemoryGraph.Stats` | Station count · loop count · total reading time. |
| `MemoryGraph.DeepestIndicator` | Shows the paragraph with the highest cumulative dwell time. |
| `MemoryGraph.Graph` | The SVG graph: stations, passages, edges, and minute axis. Clickable nodes scroll to paragraphs. |
| `MemoryGraph.IntensitySparkline` | Bar chart of per-minute reading intensity (last 60 min). |
| `MemoryGraph.Empty` | Placeholder rendered when the graph has no stations yet. |
| `MemoryGraph.Footer` / `FooterGroup` | Panel footer layout slots. |
| `MemoryGraph.PassagesToggle` | Button to show/hide passage dots. |
| `MemoryGraph.AnnotationsTrack` | Side column listing all annotations. |
| `MemoryGraph.AnnotationsTrackToggle` | Button to show/hide the annotations track. |
| `MemoryGraph.SelectionToolbar` | Contextual toolbar shown on text selection — pin or annotate. |
| `MemoryGraph.NoteEditor` | Inline note editor for an annotation. |
| `MemoryGraph.LinkReveal` | Visual highlight when hovering annotation links. |
| `MemoryGraph.Tooltip` | Hover tooltip for graph nodes, showing paragraph excerpt and stats. |
| `MemoryGraph.ExportButton` | Exports the current graph as JSON. |
| `MemoryGraph.ClearButton` | Clears all graph data from state and localStorage. |
| `MemoryGraph.Backdrop` | Full-screen overlay behind the open panel. |
| `MemoryGraph.PinToast` | Toast notification when a paragraph is pinned/unpinned. |
| `MemoryGraph.KeyboardShortcuts` | Registers global keyboard shortcuts. |

---

## 🪝 Hooks

For advanced use-cases, all core logic is available as standalone hooks.

```tsx
import {
  useMemoryGraphState,
  usePersistence,
  useAttentionTracker,
  useMemoryGraphHover,
  useTextSelection,
} from '@stitclaude/memory-graph';
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

### `useAttentionTracker(containerRef, options)`

Observes `[data-mg-id]` elements inside a container ref and emits dwell-time commits via `IntersectionObserver` + scroll (rAF-throttled) + `visibilitychange`. Faithfully ports the vanilla observation loop.

```tsx
const { currentParaId } = useAttentionTracker(zoneRef, {
  config,
  onCommit: (paraId, dwellMs, textContent) => {
    actions.commit(paraId, dwellMs, textContent);
  },
});
```

### `usePersistence(state, storageKey, restore)`

Auto-saves the graph to `localStorage` on every state change and provides JSON export/restore.

```tsx
const { exportJson, clearPersisted } = usePersistence(state, 'mg:my-article', actions.restore);
```

### `useTextSelection(options)`

Detects and resolves text selections inside the reading zone, with paragraph-level offset information — used internally by `SelectionToolbar`.

### `useMemoryGraphHover()`

Provides bidirectional hover state between graph nodes and paragraphs in the zone.

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

`memory-graph` is styled with CSS custom properties. You can import the built-in theme as a starting point and override any variable:

```css
/* Override after the theme import */
@import '@stitclaude/memory-graph/themes/stit-claude';

[data-mg-root] {
  --mg-accent: #6366f1;
  --mg-bg: #0f172a;
  --mg-handle-size: 2.75rem;
}
```

Or skip the built-in theme entirely and style from scratch using only the base layer:

```tsx
import '@stitclaude/memory-graph/styles'; // base layout only, no colors
```

---

## ⌨️ Keyboard Shortcuts

When `<MemoryGraph.KeyboardShortcuts />` is mounted:

| Shortcut | Action |
|---|---|
| `G` | Toggle the graph panel |
| `P` | Toggle passage dots in the graph |
| `Escape` | Close the panel / cancel linking mode |

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
│   ├── core/          # @stitclaude/memory-graph — the library
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
pnpm --filter @stitclaude/memory-graph test

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