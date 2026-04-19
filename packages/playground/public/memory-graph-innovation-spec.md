# Memory Graph · Innovation Spec

> **Status:** Stit'Claude approved · Reference document for v0.2 → v1.0
> **Last revised:** 2026-04-19
> **Audience:** You, Claude Code, future contributors
>
> This spec defines every innovation on the Memory Graph roadmap, with rationale,
> Stit'Claude alignment, UX flow, technical shape, and acceptance criteria.
>
> Use this as the **single source of truth** during implementation. When a
> question arises during coding, the answer is either here, or the question is a
> new decision that should be added here.

---

## Preamble · the identity of this component

Before any innovation, restate the **non-negotiables**. An innovation that violates
any of these is not an innovation — it is a degradation.

### The five laws

1. **Zero network.** All state lives in `localStorage`. Nothing is ever sent to a
   server. If sync is ever needed, it's a plugin, not a feature.

2. **Passive observation + explicit gestures.** The component watches reading
   silently (no prompts, no nudges) and responds to explicit gestures: pin,
   annotate, link, invoke. Never suggests. Never interrupts.

3. **Temporal topology only.** The Y axis is `firstAt` — the moment a paragraph
   became a station. Never force-directed, never spatial (by document position),
   never organized by topic. The graph is *time, drawn*.

4. **Return-edges curve right.** A Bézier quadratic with control point at
   `max(x1, x2) + 70px`. This is the *signature visual*. Changing it breaks the
   component's identity.

5. **3-second dwell threshold.** Below this, a paragraph is a passage, not a
   station. The threshold is calibrated against skim velocity (250 WPM) and is
   not user-configurable beyond a narrow tolerance band.

### The four calibrated numbers

| Constant | Value | Source of truth |
|----------|-------|-----------------|
| Dwell threshold | 3000ms | Skim velocity floor |
| Attention band | 40% (middle of viewport) | Eye-tracking research |
| Return-edge bend | 70px | Bézier control point offset, visual signature |
| Flash duration | 1800ms | Eye-settling time for jump-to-paragraph |

Any override of these must carry a justification. The default values are the
component.

### Naming convention · shipped API

The public API uses **`ParagraphId`** (string) and **`Node`** (station).
Older drafts of this document referred to `ZoneId`/`ZoneNode` — those names are
superseded. When reading any TypeScript snippet below, treat:

- `ZoneId` → **`ParagraphId`**
- `ZoneNode` → **`Node`**
- `zones` (as a Map) → **`nodes`** (the station map on `GraphState`)

Rationale: the DOM contract is `[data-mg-id]` on a paragraph, so the shipped
type name tracks the DOM attribute. Keeping the name aligned with the attribute
prevents drift between the types and what authors actually write in HTML/JSX.

---

## The roadmap · six innovations, three waves

Innovations are grouped into **three waves** based on dependency and risk. Do not
jump ahead — each wave builds on the previous.

```
Wave 1 · FOUNDATION (v0.2)
├── 01 · Handle variants
└── 02 · Bidirectional hover
        
Wave 2 · EXPRESSION (v0.3)
├── 03 · Text selection + annotations
└── 04 · Annotation linking
        
Wave 3 · SCALE (v0.4+)
├── 05 · Dual-view split
└── 06 · Replay mode
```

Each innovation has:
- **Why** · the problem it solves
- **Stit'Claude alignment** · which principles it applies
- **UX flow** · the reader's experience, step by step
- **Technical shape** · the types, state, and rendering approach
- **Acceptance criteria** · how we know it's done
- **Out of scope** · what's explicitly not part of this innovation

---

## Wave 1 · FOUNDATION

Priority: HIGH · Target: v0.2 · Total effort: ~1 week

---

### 01 · Handle variants

**Why.** Different sites have different design philosophies. A Substack blog wants
a visible handle to teach users the feature exists. A PRISM dashboard wants zero
distraction. A technical doc site wants keyboard-only access. Forcing one
handle style forces consumers to fork.

**Stit'Claude alignment.**
- *Honest* — the default is fidelity to the vanilla reference
- *Long-lasting* — structural choice, not cosmetic, so it won't rot
- *Respect the reader* — "keyboard only" variant respects readers who want zero UI

**UX flow.** No runtime change for the reader. This is a build-time decision by
the integrator.

**Technical shape.**

```tsx
type HandleVariant = 'permanent' | 'ghost' | 'none';

<MemoryGraph.Handle variant="permanent" />  // default · visible 32% when trail exists
<MemoryGraph.Handle variant="ghost" />       // opacity 0, revealed on hover
<MemoryGraph.Handle variant="none" />        // not rendered at all
```

CSS implementation — the three variants differ on opacity rules only, never on
structure. Hit zones remain identical (16px wide strip on left edge).

```css
.mg-handle[data-variant='permanent'] { opacity: 0.32; }
.mg-handle[data-variant='permanent']:hover { opacity: 1; }

.mg-handle[data-variant='ghost'] { opacity: 0; }
.mg-handle[data-variant='ghost']:hover { opacity: 1; }

.mg-handle[data-variant='none'] { display: none; }
```

**Acceptance criteria.**
- [ ] `variant="permanent"` reproduces vanilla exactly
- [ ] `variant="ghost"` is invisible but hit-zone remains active
- [ ] `variant="none"` removes the element entirely, `Ctrl+M` still works
- [ ] All three variants pass the hover hit test on a 16px strip
- [ ] The default value is `"permanent"` (fidelity)
- [ ] TypeScript autocomplete shows the three options
- [ ] Documented in README with one screenshot per variant

**Out of scope.**
- Custom variant values (opacity sliders, color overrides — use CSS vars for that)
- A fourth variant "floating handle in corner" — rejected, breaks edge-metaphor
- Per-user choice via in-component settings — rejected, this is design-time only

---

### 02 · Bidirectional hover

**Why.** When the panel is open, the reader's attention is split between the
graph and the article. Hovering a node currently only shows a tooltip — it does
not reveal *which paragraph* that node represents in the article. Conversely,
hovering a paragraph does not highlight its node. This is a missing affordance
that, once added, makes the graph feel *alive* and *connected* to the text.

**Stit'Claude alignment.**
- *Motion has a reason* — the highlight serves a concrete need: locating a node in context
- *Thorough to the last detail* — completes the navigation loop both ways
- *As little design as possible* — a subtle background tint, no new UI elements

**UX flow.**

*From graph to article:*
1. Panel is open, backdrop visible
2. Reader hovers a node in the graph
3. The backdrop **punches a soft highlight** over the corresponding paragraph in
   the article (tint `color-mix(in oklch, var(--mg-accent) 6%, transparent)`)
4. The highlight fades in 200ms on mouseenter, out 280ms on mouseleave
5. No scroll happens — the paragraph may be off-screen; the highlight is
   additive signal only

*From article to graph:*
1. Reader hovers a tracked paragraph (anywhere)
2. If the paragraph has a node, that node gets a subtle ring outline
   (1px dashed `var(--mg-accent)`, radius = nodeR + 4, opacity 0.6)
3. Only active when the panel is **open** — otherwise reading is undisturbed

**Technical shape.**

```tsx
// A new hook exposed by the lib
const { hoveredNodeId, setHoveredNode } = useMemoryGraphHover();

// Graph.tsx node rendering
<g onMouseEnter={() => setHoveredNode(nodeId)}
   onMouseLeave={() => setHoveredNode(null)}>
  ...
</g>

// Zone.tsx paragraph wrapping
const { hoveredNodeId } = useMemoryGraphHover();
const isHighlighted = hoveredNodeId === paraId;

<div className={clsx('mg-zone', { 'mg-zone-highlighted': isHighlighted })}>
  {children}
</div>
```

State lives in context, not in reducer — this is ephemeral UI state, not
persistent application state.

**Acceptance criteria.**
- [ ] Hovering a graph node tints its paragraph within 200ms
- [ ] Hovering a tracked paragraph outlines its node within 200ms
- [ ] No scroll triggers; highlighting is purely visual
- [ ] When panel closes, all hover state clears
- [ ] Only active when panel is open (reading is never disturbed)
- [ ] Respects `prefers-reduced-motion` (highlight becomes instantaneous)
- [ ] Paragraphs without a node (passages) still highlight their passage dot

**Out of scope.**
- Click-to-scroll from article (already exists as node click → scroll)
- Hover-triggered tooltips in the article (rejected, too noisy)
- Persistence of last-hovered (rejected, hover is ephemeral by nature)

---

## Wave 2 · EXPRESSION

Priority: HIGH · Target: v0.3 · Total effort: ~2 weeks
Wave 2 is the **killer feature wave**. It introduces the reader's voice.

---

### 03 · Text selection + annotations

**Why.** Reading long-form on the web has a silent frustration: meaningful
passages pass unmarked. Browser bookmarks are page-level. Browser highlighters
are gone on reload. Notion Web Clipper captures the entire article and requires
context-switching. The reader wants to say *"this sentence, right here,
matters"* — locally, instantly, without leaving the text.

Memory Graph already tracks *where* attention went. Annotations let the reader
mark *what they thought*. The graph becomes a **container for the reader's
active voice**, not just a passive observation.

**Stit'Claude alignment.**
- *Honest* — annotations are the reader's own words, stored only on their device
- *Motion has a reason* — the selection toolbar appears because a selection was made
- *Thorough to the last detail* — offset positions are preserved, so annotations survive page reflow
- *Long-lasting* — annotations persist in the same localStorage scope as the trail
- *Environmentally friendly* — no server, no sync, no account

**UX flow.**

1. Reader selects text inside a tracked paragraph (word, sentence, passage)
2. Upon mouseup, a **micro-toolbar** appears just below the selection
   (absolute-positioned, spring-in over 180ms)
3. The toolbar contains exactly **three actions**:
   - `◇ Note` — add a textual note
   - `⬤ Pin` — pin the parent paragraph (same as `P` key)
   - `→ Link` — link to another annotation (see innovation 04)
4. Clicking `Note` opens an inline editor:
   - Replaces the toolbar with a small text area (3 rows, autosize)
   - Monospace font, `var(--mg-font-mono)`, 11px
   - Placeholder: *"your thought…"*
   - Enter to save, Escape to cancel
   - Markdown parsed: only `*italic*` and `**bold**` (no more)
5. Upon save:
   - Selection gets a **coral underline** (1.5px `var(--mg-accent)`)
   - The underline persists visually in the article for the reader
   - A **satellite node** appears in the graph, orbiting the parent node
   - `localStorage` is updated

**Satellite node in the graph:**
- Small **coral diamond** shape (rotated square), 4px side
- Orbits the parent node at 12–16px distance
- If multiple annotations on the same node, they distribute around the parent
  at equal angles (maximum 8 visible; 9+ collapses to a "+N" badge)
- Hovering a satellite shows its note in the tooltip (italic serif)
- Clicking a satellite scrolls to the annotated text (not just the paragraph)
  and flashes it briefly

**The underline in article:**
- The selection is persisted using absolute character offsets within the
  paragraph, not DOM ranges (DOM ranges break on reflow)
- On render, the library re-builds the visual underline by walking the text
  node and wrapping the char range with a `<mark class="mg-annotation">`
- Hovering the underline shows the note in a tooltip near the text

**Technical shape.**

```tsx
// New types
export type AnnotationId = string;

export interface Annotation {
  id: AnnotationId;
  paraId: ParagraphId;        // parent paragraph
  selection: {
    text: string;             // the exact selected text (for reference)
    offsetStart: number;      // char offset in paragraph's textContent
    offsetEnd: number;
  };
  note: string | null;        // markdown-lite, nullable if selection-only
  createdAt: number;
  links: AnnotationId[];      // see innovation 04
}

// Extended GraphState (lives on state.nodes / state.edges / …)
interface GraphStateV2 {
  nodes: Map<ParagraphId, Node>;
  edges: Edge[];
  passages: Map<ParagraphId, Passage>;
  annotations: Map<AnnotationId, Annotation>;  // ← NEW in v2
  intensityBuckets: IntensityBucket[];
}

// New hook
function useTextSelection(
  onSelect: (range: SelectionRange) => void,
  options?: { minChars?: number }
): void;

// New primitive
<MemoryGraph.SelectionToolbar />
// Rendered at Root level, absolutely positioned, hidden by default
```

**Calibration of the satellites:**
- Orbit radius: `nodeR + 12px` (min 12, max 20 for the largest nodes)
- Distribution: equal angles starting at -90° (top of parent) going clockwise
- Diamond size: 4px (1 annotation) → scales to 5px if >3 annotations to
  maintain visibility
- Color: always `var(--mg-accent)` — no gradation by age or content

**Persistence format (localStorage):**

The storage key for annotations is the same as for the trail, the data is
appended to the existing payload:

```json
{
  "version": 2,
  "nodes": [...],
  "edges": [...],
  "passages": [...],
  "intensityBuckets": [...],
  "annotations": [
    {
      "id": "ann-001",
      "paraId": "p-003",
      "selection": {
        "text": "…",
        "offsetStart": 124,
        "offsetEnd": 189
      },
      "note": "This contradicts *paragraph 1*",
      "createdAt": 1737360000000,
      "links": []
    }
  ]
}
```

Note the `version: 2` field on any payload shipping annotations — bumping the
schema from `1` triggers the `persistence-migration` forward path on read.

**Acceptance criteria.**
- [ ] Selecting text in a tracked zone shows the toolbar within 180ms of mouseup
- [ ] Toolbar auto-positions below selection, flipping above if overflowing
- [ ] Selecting <4 characters does not trigger the toolbar (avoids accidental opens)
- [ ] Selection across multiple paragraphs does not trigger (rejected edge case)
- [ ] Note editor supports only `*italic*` and `**bold**` markdown
- [ ] Upon save, the coral underline appears at the correct offsets
- [ ] The underline persists on page reload
- [ ] Satellite node appears in the graph around the parent
- [ ] Hovering satellite shows the note in tooltip
- [ ] Clicking satellite scrolls to and flashes the annotated text (not paragraph)
- [ ] Annotations are included in `exportJSON()`
- [ ] Multiple annotations on same paragraph distribute around its node
- [ ] `prefers-reduced-motion` disables toolbar spring, keeps only opacity

**Out of scope.**
- Rich text editor (rejected, Tiptap/Lexical is too heavy for a lib)
- Image/emoji support in notes (rejected, markdown-lite only)
- Cross-paragraph selections (rejected, annotations are paragraph-scoped)
- Annotation search (rejected for v0.3, possibly v1.1)
- Annotation export to Readwise/Notion (rejected, violates zero-network law)
- Selection toolbar on mobile touch (rejected for v0.3, needs different UX)

---

### 04 · Annotation linking

**Why.** An annotation that *points to another annotation* is the fundamental
gesture of **thinking across a text**. When a reader notes *"this contradicts
paragraph 1"*, they are building a mental model of the essay that exceeds the
author's linear structure. Today, nowhere on the web can a reader express this
connection. Memory Graph can.

This innovation **only makes sense after 03**. It requires annotations to exist.

**Stit'Claude alignment.**
- *Honest* — links are user-created, not inferred by any algorithm
- *The off state is the baseline* — an essay with zero links looks identical to
  one that has never used the feature
- *Motion has a reason* — the secondary arc appears because the reader drew it
- *Thorough to the last detail* — bidirectional visualization, so both ends show

**UX flow.**

1. Reader already has an annotation A on paragraph 3
2. Reader selects new text on paragraph 7
3. Toolbar appears, reader clicks `→ Link`
4. The existing annotations elsewhere in the article **light up briefly** with
   a coral pulse (600ms) — the reader sees them as available link targets
5. The page enters a *linking mode*:
   - Cursor changes to a crosshair
   - Existing annotations have a small "target ring" appearing on hover
   - Escape cancels the linking mode
6. Reader clicks on annotation A
7. A new annotation B is created on paragraph 7, with `links: ['ann-A-id']`
8. Annotation A is updated to include B in its `links` array (bidirectional)
9. Linking mode exits
10. **In the graph**: a thin coral arc appears between the two satellite nodes
    (secondary arc, 0.8px, `var(--mg-accent)` at 0.65 opacity)

**The linking arc in the graph:**
- Drawn as a cubic Bézier between the two satellites
- Control points chosen to avoid crossing the main forward/return edges
- Opacity lower than return-edges to stay below the primary information layer
- Hovering one end highlights both annotations with stronger opacity
- No arrows — the relationship is symmetric (bidirectional)

**Visual grammar distinction:**

| Element | Color | Width | Shape | Layer |
|---------|-------|-------|-------|-------|
| Forward edge | gray | 1px | straight line | back |
| Return edge | coral | 1.3px | Bézier right-bend | middle |
| Annotation link | coral | 0.8px | cubic Bézier | front |

The thinness and lower opacity of the link arc ensures it reads as **secondary
information**, a semantic layer on top of the primary structure.

**Technical shape.**

```tsx
// Reducer action
type MemoryGraphAction =
  | ...
  | { type: 'CREATE_ANNOTATION_WITH_LINK'; annotation: Annotation; linkTo: AnnotationId }
  | { type: 'ADD_ANNOTATION_LINK'; from: AnnotationId; to: AnnotationId }
  | { type: 'REMOVE_ANNOTATION_LINK'; from: AnnotationId; to: AnnotationId };

// New context mode
type InteractionMode = 'idle' | 'linking';
const { mode, setMode, pendingAnnotation, setPendingAnnotation } = useLinkingMode();
```

When `mode === 'linking'`:
- Cursor is crosshair
- All existing annotations get a `data-link-target="true"` attribute
- Clicking one triggers `CREATE_ANNOTATION_WITH_LINK`
- Clicking elsewhere (including Escape) reverts to idle

**Acceptance criteria.**
- [ ] `→ Link` option in toolbar only visible if at least 1 annotation exists elsewhere
- [ ] Clicking `→ Link` enters linking mode with crosshair cursor
- [ ] Existing annotations pulse briefly on mode entry (600ms coral flash)
- [ ] Hovering an annotation in linking mode shows a target ring
- [ ] Clicking an annotation creates the link and exits linking mode
- [ ] Clicking outside or Escape cancels without creating
- [ ] Linked annotation appears in both annotations' `links` arrays (bidirectional)
- [ ] Graph shows a thin coral arc between the two satellite nodes
- [ ] Hovering one annotation highlights its linked counterparts
- [ ] Unlinking (via panel UI or keyboard) removes the link from both sides
- [ ] Links included in `exportJSON()`

**Out of scope.**
- Directed/asymmetric links (rejected — reading connections are mutual)
- Labeled links ("supports", "contradicts", etc.) — rejected, violates
  "as little design as possible"; markdown lives in the notes themselves
- Linking across different essays (rejected, scope is per-URL)
- Visualizing link graphs separately (out of graph topology for v0.3)

---

## Wave 3 · SCALE

Priority: MEDIUM · Target: v0.4+ · Total effort: ~1 week
Wave 3 expands the component's use cases beyond single-session reading.

---

### 05 · Dual-view split

**Why.** When a reader is studying an essay (not just reading it), they want
**both the text and the graph visible simultaneously**. The current modal-like
panel forces a choice: read, or look at the graph. Dual-view lets both coexist
for the session.

This is a **power-user feature** — most casual readers never need it. But for
essays being actively studied (thesis material, research, dense technical
writing), it's transformative.

**Stit'Claude alignment.**
- *Thorough to the last detail* — gives readers the tools that match their intent
- *As little design as possible* — a single toggle, not a new view hierarchy
- *Motion has a reason* — the layout transition between single and dual is
  functional, not decorative

**UX flow.**

1. Panel is open (normal modal state)
2. Reader clicks a small icon button in panel header: `◐` (half-circle)
3. Transition (400ms ease):
   - The panel shrinks to 35% of the viewport width
   - The article reflows to occupy the remaining 65% on the right
   - Backdrop disappears (not needed, nothing is covered)
   - Panel becomes **persistent** — clicking the article does not close it
4. Reader reads the article while the graph stays visible
5. Clicking a node scrolls the article (on the right) to that paragraph, and
   flashes briefly
6. To exit dual-view, click `◐` again — transition back to modal state in 400ms

**Layout rules:**
- On viewport widths < 900px, dual-view is disabled (toggle hidden). The modal
  experience is strictly better on narrow screens.
- The split ratio (35/65) is fixed — not draggable. Resizable splits are the
  slippery slope to "settings creep".
- In dual-view, the graph panel scrolls independently of the article.
- Hover-bidirectional (innovation 02) becomes especially powerful in dual-view,
  because both surfaces are always visible.

**Technical shape.**

```tsx
type PanelMode = 'modal' | 'split';

interface MemoryGraphRootProps {
  storageKey: string;
  defaultPanelMode?: PanelMode;  // default 'modal'
  allowSplitView?: boolean;       // default true, set false to hide the toggle
}

// New primitive
<MemoryGraph.ViewToggle />  // renders the ◐ icon button
```

The layout transition is a CSS-only affair using `transform` and `width`,
driven by `data-panel-mode` on a container element. No JS animation library
needed.

```css
.mg-layout[data-panel-mode='modal'] .mg-panel {
  width: clamp(340px, 32vw, 460px);
  transform: translateX(-100%);  /* hidden until open */
}

.mg-layout[data-panel-mode='split'] {
  display: grid;
  grid-template-columns: 35fr 65fr;
  transition: grid-template-columns 400ms var(--mg-ease);
}

.mg-layout[data-panel-mode='split'] .mg-panel {
  position: sticky;
  top: 0;
  height: 100dvh;
}

.mg-layout[data-panel-mode='split'] .mg-article {
  overflow-y: auto;
  height: 100dvh;
}
```

**Acceptance criteria.**
- [ ] Toggle button `◐` visible in panel header at viewports ≥ 900px
- [ ] Clicking toggle transitions modal → split in 400ms
- [ ] In split mode, panel takes 35% left, article 65% right
- [ ] Article scrolls independently in split mode
- [ ] Backdrop not rendered in split mode
- [ ] Clicking a graph node scrolls the article (right pane) smoothly
- [ ] Hover-bidirectional (innovation 02) works across both panes
- [ ] Clicking toggle again returns to modal mode
- [ ] Preference persists for the session (not across reloads, by design)
- [ ] On viewports < 900px, toggle is hidden and mode forced to modal

**Out of scope.**
- Draggable split ratio (rejected, settings creep)
- Right-side variant of the split (rejected, breaks edge-metaphor)
- Persistent split preference across reloads (rejected, session-scoped is
  enough; persistent would require settings panel)
- Dual-view on mobile (explicitly rejected, too narrow to be useful)

---

### 06 · Replay mode

**Why.** A Memory Graph is beautiful in its final form, but it hides the
**temporal drama** of reading. A reader who paused twice at paragraph 3 and then
returned an hour later after reading 6 others has a story embedded in their
graph — and replay makes it visible.

This is an **emotional feature**, not an analytical one. It's for the moment
when the reader thinks *"look how I read this"* and wants to witness their own
attention unfold.

**Stit'Claude alignment.**
- *Motion has a reason* — replay is entirely about motion as the carrier of meaning
- *Thorough to the last detail* — every edge animates in its historical order
- *As little design as possible* — one button, one progress bar, no settings
- *Honest* — the replay is the literal order of events, not summarized or interpreted

**UX flow.**

1. Panel is open, reader has a non-trivial graph (≥ 3 nodes)
2. Small icon button in panel footer: `▶` (play triangle)
3. Clicking enters replay mode:
   - Graph dims to 20% opacity (all nodes, all edges)
   - A progress bar appears at the top of the graph area
   - Playback begins — each event is replayed in chronological order
4. **Event replay sequence** (for each event, in order):
   - New station appears: node fades in with spring scale (0 → natural size in 280ms)
   - Station re-visit: existing node pulses briefly (coral ring expands and fades)
   - Annotation creation: satellite fades in with tiny spring
   - Annotation link: arc draws itself along its path (stroke-dasharray animation)
5. **Playback speed**: 1 second of replay = 10 seconds of real reading time
   - Adjustable: `1×`, `2×`, `4×` speed toggle (but not slower than 1×)
6. Replay ends, graph returns to full opacity
7. Progress bar disappears

**Visual choreography:**

The key is that replay is **not a progress meter** — it's a *performance*. The
reader should feel the shape of their reading in time. Long pauses in real
reading appear as long pauses in replay (scaled). Bursts of re-reading appear
as fast cascades.

**Controls during replay:**
- `Space` · pause/resume
- `→` / `←` · skip forward/back by 1 event
- `Escape` · exit replay, return to normal view
- Click outside the graph · exit replay

**Technical shape.**

```tsx
// A replay timeline is built from events
interface ReplayEvent {
  at: number;                    // original timestamp
  type: 'station' | 'revisit' | 'annotation' | 'link';
  payload: { /* event-specific */ };
}

function buildReplayTimeline(state: MemoryGraphState): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  state.nodes.forEach((n, id) => {
    events.push({ at: n.firstAt, type: 'station', payload: { paraId: id } });
    // revisits inferred from edges.kind === 'return'
  });
  state.edges.filter(e => e.kind === 'return').forEach(e => {
    events.push({ at: e.at, type: 'revisit', payload: { paraId: e.to } });
  });
  state.annotations.forEach(a => {
    events.push({ at: a.createdAt, type: 'annotation', payload: { id: a.id } });
  });
  return events.sort((a, b) => a.at - b.at);
}

// New hook
const { isPlaying, currentTime, speed, play, pause, setSpeed } = useReplay();

// New primitives
<MemoryGraph.ReplayControl />      // the ▶ button
<MemoryGraph.ReplayProgress />     // the progress bar
<MemoryGraph.ReplaySpeedToggle />  // 1× / 2× / 4×
```

**Acceptance criteria.**
- [ ] `▶` button visible in panel footer when nodes ≥ 3
- [ ] Clicking enters replay mode, dims the graph to 20% opacity
- [ ] Events replay in strict chronological order
- [ ] Station appearance animates with spring (scale 0 → natural)
- [ ] Revisits animate with coral pulse ring
- [ ] Annotations fade in as satellites
- [ ] Links draw themselves via stroke-dasharray animation
- [ ] Playback speed is 1 replay-second = 10 real-seconds (at 1× speed)
- [ ] Speed toggle: 1×, 2×, 4× (no slower options)
- [ ] Space toggles pause/resume
- [ ] Arrow keys skip 1 event
- [ ] Escape exits replay cleanly
- [ ] Exit returns graph to full opacity and current state
- [ ] Respects `prefers-reduced-motion`: replay is disabled (toggle hidden)

**Out of scope.**
- Exporting replay as video (rejected, violates zero-dependency)
- Replay from any custom start point (rejected, scope creep; always from start)
- Slow-motion replay below 1× (rejected, replay is a ceremony, not a tool)
- Comparing two readers' replays side-by-side (deferred to a possible v1.0
  "compare mode")

---

## Cross-cutting concerns

These affect all innovations and must be handled consistently across waves.

---

### Accessibility

All innovations respect the same accessibility contract:

- **`prefers-reduced-motion`**: animations are removed, only opacity transitions remain
- **Keyboard navigation**: every gesture has a keyboard equivalent (see below)
- **Screen readers**: proper ARIA roles, live regions for status updates
- **Focus management**: opening the panel moves focus to the panel's first
  interactive element; closing returns focus to the trigger

**Keyboard map (final, across all innovations):**

| Key | Action | Scope |
|-----|--------|-------|
| `Ctrl/⌘ + M` | Toggle panel | Global |
| `Ctrl/⌘ + Shift + /` | Toggle panel (QWERTY alternative) | Global |
| `P` | Pin current paragraph | When tracking |
| `Escape` | Close panel / cancel mode | When panel open or in mode |
| `Space` | Play/pause replay | In replay mode |
| `← / →` | Skip replay events | In replay mode |
| `Tab` | Focus next interactive element | In panel |

Linking mode, note editing, and replay each have their own keyboard handling
that scopes to their lifetime only.

---

### Performance

The component must stay fast on realistic loads:

- **60fps target** up to 200 zones tracked
- **O(1) per-event commits** — no scans of the entire state on each update
- **Virtualized rendering** not required for graphs < 500 nodes; revisit if a
  consumer reports > 500
- **Debounced localStorage writes** — 300ms debounce to avoid thrashing
- **React.memo** on `<Node>` and `<Edge>` primitives (they receive stable props)

**Memory budget:** a full state with 100 zones, 150 edges, 30 annotations, 60
intensity buckets should serialize to < 50 KB in `localStorage`.

---

### Testing discipline

Each innovation requires, before merge:

1. **Unit tests** on the reducer actions it introduces
2. **Integration test** in `packages/playground` — a page that exercises the
   feature end-to-end
3. **Manual acceptance walk-through** using the criteria above
4. **Documentation update** in the README with one screenshot or GIF

Claude Code can write the tests. You validate them. No innovation merges with
red tests.

---

### Accepting vs rejecting future ideas

When a new idea arises during development, run it through this checklist before
adding to the spec:

1. **Does it serve the reader or the author of the essay?** (Not *"does it
   look cool?"*) If no clear beneficiary, reject.

2. **Is it compatible with the five laws?** (Zero network, passive observation,
   temporal topology, return-edge curve, 3s dwell). If no, reject.

3. **Could it be a plugin instead of a core feature?** If yes, reject from core
   spec (but document as plugin-worthy).

4. **Does its acceptance criteria fit in ≤ 10 checkboxes?** If no, the idea is
   too big — break it into smaller innovations or reject.

5. **Does it require cross-device sync, user accounts, or server state?** If
   yes, reject categorically.

Ideas that pass all five enter the spec with full structure (why / alignment /
UX flow / shape / criteria / out-of-scope). Ideas that fail are documented in
the **Graveyard** section below, with the reason for rejection.

---

## The graveyard · ideas rejected, with reasons

Recorded here to prevent re-litigating the same debates.

| Idea | Rejected because |
|------|------------------|
| Cross-device sync | Violates zero-network law; opens the door to accounts, auth, RGPD |
| Topic classification (colored nodes by theme) | Violates "as little design as possible"; requires ML or manual tagging, neither acceptable |
| Drag-to-reposition nodes | Violates temporal-topology law; position encodes meaning |
| Force-directed layout | Same as above |
| Real-time sparkline during reading | Violates "passive observation"; makes reader self-conscious |
| AI-generated summary of the trail | Violates "it is a mirror, not a lens"; memory graph reports, never interprets |
| User-customizable dwell threshold slider | Violates calibration integrity; the 3s is a semantic threshold, not a preference |
| Annotation export to Notion/Readwise | Violates zero-network; also creates a dependency surface |
| Handle variants with opacity sliders | Rejected in favor of three philosophical variants (permanent/ghost/none) |
| In-component settings panel | Rejected globally; all customization is design-time (props) or action-time (footer buttons) |
| Labeled annotation links (supports/contradicts) | Violates "as little design as possible"; the label lives in the note itself |
| Cross-paragraph text selection | Violates zone-scoping; annotations belong to a single paragraph |
| Replay slower than 1× | Rejected; replay is a ceremony, not a debugging tool |
| Draggable split ratio | Rejected; settings creep |
| Right-side panel variant | Rejected; breaks the left-edge metaphor |

---

## Versioning and release plan

| Version | Contents | Target |
|---------|----------|--------|
| v0.1 | React port of vanilla (done) | Baseline |
| v0.2 | Innovations 01 + 02 | Week 2 of dev |
| v0.3 | Innovations 03 + 04 | Week 4 of dev |
| v0.4 | Innovation 05 | Week 5 of dev |
| v0.5 | Innovation 06 | Week 6 of dev |
| v1.0 | Stabilization, docs complete, first npm publish | Week 8 |

Do not skip versions. Ship v0.2 to `npm publish --tag next`, test on a real
essay site for a few days, only then move to v0.3. Each version earns its
stability before the next layer goes on top.

---

## Final word

This spec is the **contract**. It is not a wish list — it is what the component
will be, in order, with rigor.

If an innovation here turns out to be wrong during implementation, update the
spec before writing code that contradicts it. Write the rationale for the
change. Do not let code silently drift from spec.

**The reader is the customer.** Every feature must earn its place by what it
gives the reader, not what it adds to the codebase.

Sign it off each time you revise it.

> Reviewed and approved by Stit'Claude philosophy · 2026-04-19
