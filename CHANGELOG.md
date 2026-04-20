# Changelog

All notable changes to `@stitclaude/memory-graph` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — Unreleased

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

[Unreleased]: https://github.com/Myrkh/memory-graph
