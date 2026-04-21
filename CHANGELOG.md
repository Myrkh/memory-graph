# Changelog

All notable changes to `@myrkh/memory-graph` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-04-21 · *Ambient memory-graph*

The graph becomes **ambient** — it follows the reader across a multi-
screen site or app, not just a single article. Zero breaking change : every
new surface is opt-in, and legacy graphs fall back to single-column mode.

### Added — Route dimension (multi-page tracking)

- `<MemoryGraph.Root route?: string>` — abstract route bucket stamped on
  every tracked node at commit time. Whatever the consumer passes
  (pathname, tabId, docId, feature flag). Agnostic of any routing library.
- `Node.route?: string` — the route each node belongs to, set once on
  first promotion (birth-route, immutable).
- Reducer backfills `route` on re-commit for legacy nodes without one, so
  existing graphs upgrade without forcing `clearPersisted()`.
- Commit + togglePin actions accept an optional `route` payload.

### Added — 2D column layout

- Automatic multi-column mode when ≥ 2 unique routes accumulate. Each
  route gets its own column, ordered **chronologically** by first-seen
  timestamp (not alphabetically). Single-column mode stays the default.
- `GraphLayout.columns?: RouteColumn[]` exposed in the pure layout output
  for consumers reading layout state.
- **Law 3 preserved** · Y = `firstAt`-driven within every column.
- **Law 4 preserved** · return arcs curve right, same control-point formula.
- **Route-jump edges** get `data-mg-route-jump` — coral dashed for
  forwards, dashed return arcs, so crossing a route boundary reads visually.
- Horizontal scroll kicks in on the graph wrap; `scroll-snap-type: x
  proximity` aligns columns cleanly. Thin scrollbar coral-tinted on hover.
- Sticky column headers (mono kicker, uppercase) via SVG-embedded text —
  coral on the current route, muted elsewhere.
- Auto-follow · when the `route` prop changes, the graph smooth-scrolls
  horizontally to center the matching column.

### Added — `renderNode` escape hatch

- `<MemoryGraph.Graph renderNode?: (item, ctx) => ReactNode | null>` —
  per-item custom SVG without polluting `NodeKind` with site-specific
  values. Return `null` to fall back to the default kind shape. Pulse,
  pinned ring, highlight ring and order label stay library-managed.
- Enables consumers to give a specific tracked element (theme toggle,
  KPI widget, landmark brand mark) its own iconography without forking.

### Added — Zoom controls with Stit'Claude signature

- Three-button floating satellite (zoom in · fit · zoom out) hanging
  outside the panel's right edge in a hairline backdrop-blur pill.
  Custom 24×24 SVG icons sharing the component's visual grammar — coral
  node, hairline 1.3px strokes, round linecaps. Each icon *enacts* its
  verb on hover (aperture contracts, satellites cascade, chevrons clamp).
- **Focal-point zoom** — the viewport center stays anchored at the same
  SVG coordinate through the zoom transition. Effective zoom is read
  from the DOM (`getBoundingClientRect`) so rapid repeat clicks don't
  jolt the viewport.
- **Blur escamotage** — a 280ms `blur(0) → blur(1.6px) → blur(0)`
  keyframe masks any perceptual jitter during the parallel scroll +
  dimension transition. Apple-HIG focus-racking in spirit.
- `useGraphZoom` hook exposed as an internal primitive, exercised by the
  `<Graph>` primitive's `GraphControls` toolbar.
- Visibility gated by `[data-mg-open]` so the satellite doesn't linger
  off-screen with the closed panel. Mobile fallback (<520px) pulls it
  back inside the graph area.

### Added — `onPersistError` callback

- `<MemoryGraph.Root onPersistError?: (err) => void>` — called when
  `localStorage.setItem` throws (quota exceeded, private-mode sandbox,
  disabled storage). Lets consumers surface a toast or downgrade a
  feature instead of failing silently. Still swallowed by default.

### Added — Intertab sync (same origin)

- `usePersistence` now listens to the native `storage` event. When any
  tab on the same origin writes to `storageKey`, every other tab picks
  it up and calls `onRestore`, keeping in-memory state consistent across
  all open tabs. Zero dependency, zero new API surface.
- Write effect gained a guard : if `localStorage.getItem` already matches
  the serialized state, the write is skipped. Breaks the cross-tab echo
  loop cleanly and avoids redundant serialization on re-renders.

### Added — Annotations universal

- `useZoneAnnotations` moved from `<Zone>` to `<Root>`, with a
  `document.body` fallback when no Zone is mounted. Annotations now
  render on **any** `[data-mg-id]` element anywhere on the page —
  multi-page sites, sidebar content, floating panels — instead of only
  descendants of a Zone.

### Added — Node Anatomy living documentation

- New `/docs` section : *Sizing · Kinds · States* — every specimen is
  rendered through the library's own CSS classes (`.mg-node`,
  `.mg-node-shape`, `.mg-node-pulse`, `.mg-node-ring`…) so the docs
  track the component automatically. If a keyframe, a radius, or a
  color changes, the docs update without intervention.

### Added — Tests

- Reducer · route stamping, legacy backfill, birth-route immutability.
- Layout · single-column vs multi-column activation, chronological
  column order, totalWidth expansion, column centerX anchoring, law 3
  preservation in 2D mode. **23/23 tests pass** (+11 from v0.1.0's 12).

### Enhanced — Root.tsx refactor

- Extracted `useTimedValue<T>(durationMs)` hook that consolidates the
  three duplicate timed-flash patterns (paragraph flash, toast, annotation
  flash). Trimmed Root.tsx from 311 → 264 lines, back under the
  project-wide ≤300 discipline.

### Enhanced — `<Graph>` structural fix

- Restored the panel's flex chain (`flex: 1; display: flex;
  flex-direction: column; min-height: 0`) on the `.mg-graph-container`
  wrapper introduced for the zoom satellite, so the graph scroll and
  panel footer keep working inside composed panel layouts.

### Playground — Ambient wiring

- Site-wide `<Root route={pathnameFromPage(page)}>` at app shell.
- TopNav links tracked (`data-mg-id="nav-home"` etc).
- `ThemeToggle` tracked as `kpi` kind, rendered via `renderNode` as a
  morphing sun/moon node that reacts live to `data-mg-scheme` via a
  MutationObserver-based `useCurrentScheme` hook.
- History API routing (was hash routing in v0.1.0) so Google indexes
  `/`, `/demo`, `/docs`, `/philosophy` as separate documents.

## [0.1.0] — 2026-04-20

The inaugural public release. React + TypeScript port of the vanilla
memory-graph component, plus five waves of post-port architecture work
that make the library genuinely multi-DOM, multi-strategy, and uniform
across element types.

### Added — Provider-at-root pattern

- `<MemoryGraph.Root>` is now a canonical Provider — wrap your app once,
  put `[data-mg-id]` on any element anywhere in the tree. Matches the
  shape of `<QueryClientProvider>`, `<TooltipProvider>`, Redux `<Provider>`.
- `<Zone>` becomes optional. When mounted, it scopes the tracker +
  bridges; when absent, both fall back to `document.body`, unlocking
  zero-Zone usage for dashboards / Chrome extensions.
- Context exposes `zoneElement` (state) + `setZoneElement` (callback
  ref) instead of a mutable `zoneRef` — observers re-run on zone
  mount/unmount cycles across route changes under a persistent Root.
  Fixes stale IntersectionObserver bindings when pages swap.

### Added — Multi-strategy capture

- Four capture strategies routed by `data-mg-strategy`:
  - `viewport` (default) — reading-mode dwell inside the attention band
  - `hover` — pointer rests on the element for `data-mg-dwell` ms
  - `click` — element is clicked (instant station promotion)
  - `focus` — keyboard focus rests on the element for `data-mg-dwell` ms
- Each strategy ships as a standalone hook —
  `useViewportStrategy` / `useHoverStrategy` / `useClickStrategy` /
  `useFocusStrategy` — composed by `useAttentionTracker`. All converge
  on a single `onCommit(paraId, dwellMs, textContent, kind?)` callback.
- `hover` and `focus` strategies commit with `DWELL_MS` synthetic dwell
  (promotion guaranteed) — intent gestures are never passages.
- Per-element `data-mg-dwell="N"` override for hover/focus trigger
  thresholds. Delegation-based implementation, zero MutationObserver —
  dynamic DOM elements just work.
- Public: `NodeStrategy` type, four strategy hooks, all typed options
  exported.

### Added — Smart inference (`strategyInference: 'smart' | 'explicit'`)

- `inferStrategy(el)` reads semantic HTML: `<button>`/`<a>` → click,
  `<input>`/`<textarea>` → focus, rest → viewport. Zero-annotation
  ergonomics for the "wrap the app once, mark anything" use-case.
- `resolveStrategy(el, mode)` combines explicit `data-mg-strategy` with
  the inference mode. Explicit attribute always wins.
- Default mode is `'smart'`; switch to `'explicit'` for strict control.

### Added — Rich-children annotations + uniform rendering

- `<MemoryGraph.Paragraph>` accepts rich JSX children (not just strings).
  Nested markup (`<em>`, `<code>`, `<ul>`…) fully supported — the
  annotation renderer walks the tree and emits one `<mark>` per crossed
  text chunk, all sharing the same `data-mg-annotation-id` so hover /
  link / flash behave as a single visual unit.
- All annotation rendering moved from `<Paragraph>` into `<Zone>` via a
  new `useZoneAnnotations(zoneRef, …)` hook. Every `[data-mg-id]`
  descendant — `<p>`, `<aside>`, `<figure>`, `<blockquote>`, raw
  `<div>` — receives uniform annotation treatment. No primitive wrapper
  required.
- New `internal/annotation-dom.ts` module with pure DOM utilities:
  `wrapAnnotationRange`, `applyBlockAnnotation`, `clearAnnotations`,
  `detectScope`. TreeWalker-based wrapping handles nested elements
  without `Range.surroundContents` throwing on element boundaries.
- **SVG guard** — text nodes inside `<svg>` skip inline wrapping
  gracefully (HTML `<mark>` can't live inside the SVG namespace). The
  annotation still exists in state and surfaces in the Track + tooltip
  + graph; only the inline visual is dropped. Block-scope annotations
  on the `<figure>` itself always work.

### Added — Text vs block annotation scope

- New `AnnotationScope = 'text' | 'block'` type on `Annotation`.
- `detectScope(el, offsetStart, offsetEnd)` auto-detects: selection
  covering the full `textContent` (Cmd+A, triple-click, drag entire
  block) → `block`; any partial selection → `text`.
- Block scope renders as `data-mg-annotated="block"` on the element,
  styled as a coral left stripe + subtle tint — same visual grammar as
  the inline mark, at card level.
- Text scope renders as inline `<mark class="mg-annotation">` on the
  range, preserved from the original behavior.
- Hover deepens the tint; link-counterpart outlines; flash animation —
  all consistent between scopes.

### Added — Node kinds (visual differentiation)

- Five geometric kinds on the graph, selected via `data-mg-kind`:
  - `paragraph` (default) — circle
  - `heading` — concentric ring
  - `kpi` — square (hard edges)
  - `figure` — diamond (rotated square)
  - `code` — rounded square
- Smart inference from tagName: h1-h6 → `heading`, `<figure>`/`<img>` →
  `figure`, `<pre>` → `code`. `kpi` requires explicit opt-in.
- `<NodeRing>` mirrors the shape geometry so pinned / hover /
  highlight outlines read as the same coral signature across every kind.
- All existing effects (pulse current, pinned ring, chain dimming,
  order label) are preserved on every kind — zero regression.
- Reducer backfills `kind` on re-commit for nodes persisted before this
  release, so upgrading consumers don't need to `clearPersisted()`.
- Public: `NodeKind`, `KindInference`, `inferKind`, `resolveKind`.

### Added — Data model & types

- `ParagraphId`, `Node` (with `kind?`), `Passage`, `Edge`, `EdgeKind`,
  `IntensityBucket`, `GraphState`, `SerializedGraph`.
- `Annotation` (with `scope?`), `AnnotationId`, `AnnotationScope`
  (§Innovation 03).
- `NodeStrategy`, `NodeKind`, `StrategyInference`, `KindInference`.
- `MemoryGraphConfig` + `DEFAULT_CONFIG` (13 runtime constants
  mirroring the vanilla reference line-for-line).
- `StationItem`, `PassageItem`, `GraphItem` — renderable item contracts.
- `CURRENT_SCHEMA_VERSION` (`2`) exported for consumers needing to
  introspect persisted payloads.

### Added — Hooks (public API)

- `useMemoryGraphState(config)` — `useReducer`-based state machine.
  Returns `{ state, actions, derived, showPassages, previousStationId }`.
  Derived metrics: `stationCount`, `loopCount`, `totalMs`, `pinCount`,
  `deepest`.
- `usePersistence(state, storageKey, onRestore)` — localStorage
  auto-save, forward schema migration, richer `exportJson(meta?)`,
  `clearPersisted()`.
- `useAttentionTracker(zoneElement, options)` — composer over the four
  per-strategy hooks. Accepts a live `HTMLElement | null` (not a ref);
  re-runs when the zone mounts / unmounts. Options: `config`,
  `onCommit`, `hoverDwellMs`, `focusDwellMs`, `strategyInference`,
  `kindInference`.
- Four per-strategy hooks: `useViewportStrategy`, `useHoverStrategy`,
  `useClickStrategy`, `useFocusStrategy`. Use these directly for
  granular control.
- `useZoneAnnotations(zoneRef, options)` — imperative annotation
  renderer (render marks, flash, counterpart outline). Used internally
  by `<Zone>`.
- `useMemoryGraphHover()` — bidirectional hover state (§Innovation 02).
- `useTextSelection(zone, options)` — resolves live
  `window.getSelection()` into paragraph-scoped character offsets.
  Rejects cross-paragraph and sub-4-char selections.
- `useFocusTrap(ref, active)` — focus trap for the panel, restores the
  previously focused element on cleanup.
- `useMemoryGraphContext()` — advanced escape hatch exposing the full
  context value for consumers composing their own primitives.

### Added — Primitives

Twenty-five composable primitives exported via named exports and the
`MemoryGraph.*` namespace:

| Category | Primitives |
|---|---|
| Root + zone | `Root`, `Zone`, `Paragraph` |
| Handle + backdrop | `Handle`, `Backdrop` |
| Panel shell | `Panel`, `Head`, `TitleRow`, `Title`, `CloseButton` |
| Panel content | `Stats`, `DeepestIndicator`, `Empty`, `Graph`, `IntensitySparkline` |
| Footer | `Footer`, `FooterGroup`, `ClearButton`, `ExportButton`, `PassagesToggle` |
| Annotations | `SelectionToolbar`, `NoteEditor`, `LinkReveal` |
| Track (§Innovation 04 polish) | `AnnotationsTrack`, `AnnotationsTrackToggle` |
| Feedback | `PinToast`, `Tooltip`, `KeyboardShortcuts` |

### Added — Styles & theming

The inaugural release. A full React + TypeScript port of the vanilla
`memory-graph` reference component with four innovations on top (see §Waves
below). Produced under the Stit'Claude design discipline — token-only,
motion-tokenised, fidelity-first.

### Added — Data model & types

- `ParagraphId`, `Node`, `Passage`, `Edge`, `EdgeKind`, `IntensityBucket`,
  `GraphState`, `SerializedGraph`.
- `Annotation`, `AnnotationId` (§Innovation 03).
- `MemoryGraphConfig` + `DEFAULT_CONFIG` (13 runtime constants mirroring the
  vanilla reference line-for-line).
- `StationItem`, `PassageItem`, `GraphItem` — renderable item contracts.
- Export `CURRENT_SCHEMA_VERSION` (`2`) for consumers needing to introspect
  persisted payloads.

### Added — Hooks (public API)

- `useMemoryGraphState(config)` — `useReducer`-based state machine. Returns
  `{ state, actions, derived, showPassages, previousStationId }`. Derived
  metrics: `stationCount`, `loopCount`, `totalMs`, `pinCount`, `deepest`.
- `usePersistence(state, storageKey, onRestore)` — localStorage auto-save,
  forward schema migration, richer `exportJson(meta?)`, `clearPersisted()`.
- `useAttentionTracker(zoneRef, { config, onCommit })` — `IntersectionObserver`
  with thresholds `[0, 0.25, 0.5, 0.75, 1]` + scroll (rAF-throttled) +
  `visibilitychange`. Faithful port of the vanilla observation loop.
- `useMemoryGraphHover()` — bidirectional hover state (§Innovation 02).
- `useTextSelection(zoneRef, options)` — resolves live `window.getSelection()`
  into paragraph-scoped character offsets (not DOM ranges — offsets survive
  reflow). Rejects cross-paragraph and sub-4-char selections.
- `useMemoryGraphContext()` — advanced escape hatch exposing the full context
  value for consumers composing their own primitives.

### Added — Primitives

Twenty-four composable primitives exported via named exports and the
`MemoryGraph.*` namespace:

| Category | Primitives |
|---|---|
| Root + zone | `Root`, `Zone`, `Paragraph` |
| Handle + backdrop | `Handle`, `Backdrop` |
| Panel shell | `Panel`, `Head`, `TitleRow`, `Title`, `CloseButton` |
| Panel content | `Stats`, `DeepestIndicator`, `Empty`, `Graph`, `IntensitySparkline` |
| Footer | `Footer`, `FooterGroup`, `ClearButton`, `ExportButton`, `PassagesToggle` |
| Annotations | `SelectionToolbar`, `NoteEditor`, `LinkReveal` |
| Track (§Innovation 04 polish) | `AnnotationsTrack`, `AnnotationsTrackToggle` |
| Feedback | `PinToast`, `Tooltip`, `KeyboardShortcuts` |

### Added — Styles & theming

- **Base token defaults layer** (`src/styles/base/_defaults.css`) — every
  `--mg-*` token declared at `:where(:root)` with zero specificity, so the
  component renders correctly with no theme loaded. Pattern aligned with
  shadcn/ui and Radix Colors.
- **stit-claude theme** (`themes/stit-claude.css`) — OKLCH palette (ink-1..12
  + coral-3..11), Fraunces + Instrument Serif + Inter + JetBrains Mono via
  Google Fonts, motion tokens, radii. Light scheme by default; dark scheme
  via `[data-mg-scheme="dark"]`.
- **Custom CSS build** — a dedicated Node script (`scripts/build-styles.mjs`)
  inlines seventeen focused base modules into a single shipped
  `dist/styles/base.css`. Every source file ≤ 300 lines.
- **Explicit `::selection`** rule in the stit-claude theme so native selection
  highlight never visually collides with coral annotations.

### Added — Innovation 01 · Handle variants

- `<Handle variant="permanent" | "ghost" | "none" />` — three distinct
  philosophies, not three cosmetic sliders. `permanent` = faithful vanilla,
  `ghost` = hover-reveal only, `none` = render nothing (keyboard-only or
  custom trigger via `useMemoryGraphContext().openPanel`).

### Added — Innovation 02 · Bidirectional hover

- Shared `hoveredNodeId` between text spans and graph nodes. Hovering a
  paragraph in the Zone outlines the matching node with a dashed coral ring;
  hovering a graph node tints the paragraph in the text.
- Active only while the panel is open — reading is never disturbed.
- `prefers-reduced-motion` collapses the 200/280ms fade to instantaneous.

### Added — Innovation 03 · Text selection + annotations

- `<SelectionToolbar />` — micro-toolbar floating under qualifying text
  selections (≥ 4 chars, single paragraph). Auto-flips above when near the
  bottom viewport edge. Three actions: Note · Pin · Link.
- `<NoteEditor />` — inline autosize textarea, `Enter` saves, `Escape`
  cancels. Markdown-lite preview with italic + bold only.
- Markdown-lite parser (`internal/markdown-lite.tsx`) — iterative single-pass
  tokenizer, O(n), zero recursion, zero regex backtracking. Unterminated
  sequences (e.g. `**bold`) never hang the UI.
- Annotations persisted via paragraph `textContent` offsets — survive reflow,
  font-size changes, and any DOM re-layout.
- Coral underline + subtle background tint on annotated spans in the text.
- **Satellite diamonds** in the graph — small coral rhombi orbiting their
  parent station node. Multi-annotations distribute at equal angles; 9+
  collapse into a `+N` badge.
- Annotation tooltip variant in `<Tooltip />` showing the note in italic
  serif with markdown-lite rendered.

### Added — Innovation 04 · Annotation linking

- Symmetric, bidirectional links between annotations.
- `→ Link` button in the selection toolbar enters a page-wide *linking mode*
  with crosshair cursor, a 600ms pulse on every available target, and a
  dashed outline ring on hover. `Escape` or click-outside cancels.
- Dashed coral arcs (`stroke-dasharray: 3 2`, 0.8px) between linked
  satellites in the graph — distinct from the solid return-edges' texture.
- Small `›` chevron after the underline for every linked annotation in the
  text, with a 180ms opacity transition on hover (stable at 1.0 afterward).

#### Innovation 04 · polish

- **`<LinkReveal />`** — fixed-position SVG overlay that draws a dashed
  coral arc between the hovered annotation and each of its on-screen link
  targets. Three-phase 600ms animation: 0-400ms the line draws itself
  (`stroke-dashoffset` from `getTotalLength()` to 0 via `--mg-ease-expo-out`),
  400-600ms the stroke dasharray settles from solid to 3/2, 200-500ms the
  counterpart outline lands. Off-screen targets silently skipped.
- **`<AnnotationsTrack />`** — secondary column anchored to the right of the
  panel, rendering a vertical git-graph-style list of every annotation with
  its links. Timestamp + sequence (`ANN-NN · HH:MM`, tabular nums), extract,
  note preview, link count. Slide-in animation with staggered row fade-in.
  Architectural choice: **sibling of Panel**, not child — zero breaking
  change to the Panel primitive.
- **Chain highlighting** — hovering a graph node fades everything outside
  its *strict* 1-hop ego set (edges touching the node + their endpoints +
  the hovered node's annotations + annotations those link to). Strict
  semantics: the question answered is "where does THIS node go", not "what
  is in its neighborhood". Passages keep a 0.5 dimmed opacity even in-chain
  — they stay context, never the feature. Triple-surface coordination:
  hovering a Track row sets both `hoveredAnnotationId` and `hoveredNodeId`,
  so Track → text counterpart ring → graph chain all light up together.

### Added — Persistence

- **Schema v2** with forward migration. `parseStoredPayload()` reads legacy
  v1 payloads (no `annotations` field), backfills `annotations: []`, and
  returns a current-shape `SerializedGraph`. Unknown higher versions are
  refused with a `console.warn` — never crashes the consumer.
- **`exportJson(meta?)`** — richer JSON payload including `url`,
  `capturedAt`, flattened `nodes` / `passages` / `annotations` arrays, and
  derived `metrics` (`nodeCount`, `loopCount`, `totalReadMs`, `pinCount`,
  `annotationCount`).

### Added — Playground (`packages/playground`)

- Three variant pages — `01-permanent`, `02-ghost`, `03-none` — each demoing
  the corresponding `<Handle>` variant.
- Hash-based routing with zero router dependency (`useSyncExternalStore`
  bound to `hashchange`).
- Light/dark scheme toggle pill, persisted to `localStorage` under
  `mg-playground:scheme`.
- Vanilla reference HTML preserved at `/public/reference-vanilla.html` for
  side-by-side behavioural comparison with the React port.

### Infrastructure

- pnpm workspaces monorepo — `packages/core` (the library) and
  `packages/playground` (throwaway lab).
- Library build via `tsup` — ESM-only, external React, source maps, DTS with
  declaration maps.
- TypeScript strict mode across both packages: `strict`,
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`,
  `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`.
- Vitest with twelve unit tests covering reducer transitions: passage
  creation, station promotion with forward edge, re-visit accumulation and
  return edge emission, short re-visit passthrough (vanilla fidelity),
  togglePin, restore with `previousStationId` recomputation, annotation
  add/update/remove (including link-scrubbing on delete), link bidirectional
  + idempotent, `addAnnotationWithLink`.
- `.npmrc` configured for `auto-install-peers` and workspace linking.

### Design constraints (enforced project-wide)

- Zero source file exceeds 300 lines.
- Structural CSS reads only `--mg-*` tokens — zero hardcoded values.
- Motion ≤ 300ms by default, ≤ 800ms for narrative moments, all durations
  and easings sourced from the token system.
- `prefers-reduced-motion` branch on every animation.
- Zero network at runtime — no telemetry, no sync, no analytics. The
  stit-claude theme does import Google Fonts; consumers can opt out by
  dropping the theme and using the base defaults or a custom theme.
- APCA targets Lc ≥ 75 for body text on the default stit-claude palette.
- Respect `prefers-reduced-motion` as a proxy for "no haptics/audio either"
  when those channels are later added.

[0.2.0]: https://github.com/Myrkh/memory-graph/releases/tag/v0.2.0
[0.1.0]: https://github.com/Myrkh/memory-graph/releases/tag/v0.1.0
