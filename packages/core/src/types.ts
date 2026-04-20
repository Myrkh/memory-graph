/**
 * Core types for @myrkh/memory-graph.
 *
 * Mirrors the data model of the vanilla reference component
 * (packages/playground/public/reference-vanilla.html). Any change here should
 * keep observable behavior identical to that file.
 */

/**
 * Unique identifier for an observed paragraph.
 *
 * In the vanilla component this is the value of `data-mg-id` on each
 * observed element — an author-chosen opaque string (slug, hash, index…).
 * Kept as `string` to stay serialisable and to support any scheme.
 */
export type ParagraphId = string;

/**
 * Capture strategy for a tracked element. Selected at the DOM level via
 * `data-mg-strategy="<value>"`. Defaults to `viewport` when the attribute
 * is absent.
 *
 * - `viewport` — classic reading mode: element centered in the attention
 *   band for `DWELL_MS` is promoted to a station. Suited for paragraphs,
 *   headings, figures — anything consumed by scroll.
 * - `hover` — cursor rests on the element for `data-mg-dwell` ms (default
 *   1500). Suited for KPI cards, sidebar entries, menu items — small UI
 *   atoms the eye pauses on.
 * - `click` — element is clicked. Suited for tabs, buttons, links,
 *   discrete user intents. Commits with `DWELL_MS` as synthetic dwell so
 *   the node promotes to a station on a single click.
 * - `focus` — element receives keyboard focus for `data-mg-dwell` ms.
 *   Suited for form inputs, data-grid cells, accessible flows.
 *
 * Manual tracking (dashboard events, custom signals) is performed via
 * `actions.commit(id, dwellMs, text)` — no DOM attribute needed.
 */
export type NodeStrategy = 'viewport' | 'hover' | 'click' | 'focus';

/**
 * Visual kind of a tracked element — drives the shape the node takes in
 * the graph. Orthogonal to {@link NodeStrategy}: strategy = how we decide
 * to track, kind = how we draw it.
 *
 * - `paragraph` (default) — circle, the canonical reading station
 * - `heading` — concentric ring around the disc, signals landmark
 * - `kpi` — square, hard-edged datapoint (no HTML tag maps to this; set
 *   it explicitly via `data-mg-kind="kpi"`)
 * - `figure` — diamond (rotated square), media / illustration
 * - `code` — rounded square, monospace feel
 *
 * Selected at the DOM level via `data-mg-kind`, or inferred from tagName
 * when inference is `smart`.
 */
export type NodeKind = 'paragraph' | 'heading' | 'kpi' | 'figure' | 'code';

/**
 * A "station": a paragraph that was dwelled on long enough (>= `DWELL_MS`)
 * to be worth pinning on the graph.
 */
export interface Node {
  /** 0-based index of first promotion to station — used to keep stable ordering across renders. */
  order: number;
  /** Epoch ms of the first time this paragraph became a station. */
  firstAt: number;
  /** Cumulative dwell time across every visit, in ms. */
  totalMs: number;
  /** Number of distinct visits (first commit = 1, every re-entry +1). */
  visits: number;
  /** User-pinned flag. */
  pinned: boolean;
  /** Short text excerpt used for tooltips and the "deepest" label. */
  extract: string;
  /** Visual kind — drives the graph shape. Defaults to `paragraph` when omitted. */
  kind?: NodeKind;
  /**
   * Abstract "route" bucket the node belongs to — whatever the consumer
   * passes via `<MemoryGraph.Root route="…">` at commit time. Agnostic of
   * any routing library: can be a URL path, a tab id, a document id, a
   * mode name, anything. Drives the 2D column layout in the graph when
   * two or more unique routes are present in state.
   */
  route?: string;
}

/**
 * A "passage": a paragraph that was crossed but below the dwell threshold.
 * Rendered as a small dot only when the user toggles passages on.
 */
export interface Passage {
  /** Epoch ms of the first time this paragraph was observed. */
  firstAt: number;
  /** Short text excerpt (shorter than a station's — the vanilla uses 60 chars). */
  extract: string;
}

/**
 * Edge direction kind.
 * - `forward`: the first transition from one station to a **newly** promoted station.
 * - `return`: a transition back to an already-existing station.
 */
export type EdgeKind = 'forward' | 'return';

/** A directed transition between two stations. */
export interface Edge {
  from: ParagraphId;
  to: ParagraphId;
  kind: EdgeKind;
  /** Epoch ms when the transition happened. */
  at: number;
}

/**
 * One bucket of reading intensity, used to draw the sparkline.
 * The vanilla caps the history at 60 buckets (i.e. ~last hour).
 */
export interface IntensityBucket {
  /** Minute key, `Math.floor(Date.now() / 60_000)`. */
  m: number;
  /** Total dwell time credited to this minute, in seconds. */
  s: number;
}

/**
 * Live in-memory graph state.
 *
 * Uses native `Map` for O(1) id lookups. Serialise through {@link SerializedGraph}
 * before persisting — `Map` does not round-trip through `JSON.stringify`.
 */
export interface GraphState {
  nodes: Map<ParagraphId, Node>;
  edges: Edge[];
  passages: Map<ParagraphId, Passage>;
  annotations: Map<AnnotationId, Annotation>;
  intensityBuckets: IntensityBucket[];
}

/**
 * Current on-disk schema version for {@link SerializedGraph}. Bumped each
 * time the persisted payload shape changes. Older versions are migrated
 * forward on read (see `internal/persistence-migration.ts`).
 *
 * - `1` — initial shape: nodes / edges / passages / intensityBuckets
 * - `2` — Wave 2 · adds `annotations`
 */
export const CURRENT_SCHEMA_VERSION = 2 as const;

/** Opaque annotation identifier (generated by the library). */
export type AnnotationId = string;

/**
 * Scope of an annotation's visual treatment.
 *
 * - `text` — the selection is a sub-range of the element's textContent.
 *   Rendered as an inline `<mark>` wrapping the exact range (coral
 *   underline). Default scope — matches the long-form reading use-case.
 * - `block` — the selection covers the element in full. Rendered as a
 *   card-level treatment on the `[data-mg-id]` element itself (coral
 *   left stripe + subtle tint), matching the rest of the annotation
 *   visual language without flooding the card with inline underlines.
 *   The library detects block scope automatically when the user selects
 *   from offset 0 through the complete textContent length.
 */
export type AnnotationScope = 'text' | 'block';

/**
 * A reader-authored mark on a span of paragraph text. Innovation 03 · the
 * "reader's voice" feature. Selection offsets are character indices inside
 * the paragraph's `textContent`, not DOM ranges — offsets survive reflow.
 */
export interface Annotation {
  id: AnnotationId;
  paraId: ParagraphId;
  selection: {
    /** The exact selected text (reference + fallback). */
    text: string;
    /** Character offset start within the paragraph's textContent. */
    offsetStart: number;
    /** Character offset end (exclusive) within the paragraph's textContent. */
    offsetEnd: number;
  };
  /** Markdown-lite note (only `*italic*` and `**bold**`). Null = selection only. */
  note: string | null;
  /** Epoch ms when the annotation was created. */
  createdAt: number;
  /** Cross-annotation links (Innovation 04). Empty array when unused. */
  links: AnnotationId[];
  /** `text` (default) or `block` when the selection covered the element in full. */
  scope?: AnnotationScope;
}

/**
 * JSON-friendly projection of {@link GraphState}.
 * `Map` entries are serialised as `[key, value][]` tuples, matching the
 * vanilla `persist()` / `restore()` format in localStorage. Annotations
 * are stored as a flat array because their `id` is already in each record.
 */
export interface SerializedGraph {
  /** Schema version. Legacy payloads without this field are treated as v1. */
  version: number;
  nodes: [ParagraphId, Node][];
  edges: Edge[];
  passages: [ParagraphId, Passage][];
  annotations: Annotation[];
  intensityBuckets: IntensityBucket[];
}

/**
 * A renderable item — either a station or a passage, tagged with `type`.
 * The graph renderer unifies both kinds before computing layout.
 */
export type GraphItem = StationItem | PassageItem;

/** Station projected as a renderable item. */
export interface StationItem extends Node {
  id: ParagraphId;
  type: 'station';
}

/**
 * Passage projected as a renderable item. The extra fields
 * (`totalMs`, `visits`, `pinned`, `order`) are held at their neutral
 * values so station and passage share the same render contract.
 */
export interface PassageItem {
  id: ParagraphId;
  type: 'passage';
  firstAt: number;
  extract: string;
  totalMs: 0;
  visits: 0;
  pinned: false;
  order: -1;
}

/**
 * Runtime + visual configuration. Mirrors the vanilla `CONFIG` object
 * verbatim (see reference-vanilla.html line ~1368).
 *
 * All distances are in CSS pixels; all durations are in ms unless noted.
 */
export interface MemoryGraphConfig {
  /** Minimum dwell time (ms) before a paragraph is promoted to a station. */
  DWELL_MS: number;
  /** Fraction of the viewport height used as the "centered" detection band (0–1). */
  BAND_RATIO: number;
  /** localStorage key used to persist the graph. */
  STORAGE_KEY: string;

  /** Top padding inside the SVG viewport. */
  GRAPH_PADDING_TOP: number;
  /** Bottom padding inside the SVG viewport. */
  GRAPH_PADDING_BOTTOM: number;
  /** Horizontal padding inside the SVG viewport. */
  GRAPH_PADDING_X: number;
  /** Minimum vertical spacing between two consecutive nodes. */
  MIN_NODE_SEPARATION_Y: number;
  /** Horizontal center of the graph, as a fraction of SVG width (0–1). */
  CENTER_X_RATIO: number;
  /** Alternating left/right horizontal offset from center. */
  NODE_OFFSET_X: number;
  /** How far right `return` edges bend through a Bézier control point. */
  RETURN_BEND: number;

  /** Minimum radius for a station disc. */
  NODE_R_MIN: number;
  /** Maximum radius for a station disc (reached at the deepest node). */
  NODE_R_MAX: number;
  /** Fixed radius for a passage dot. */
  PASSAGE_R: number;
}

/**
 * Default configuration — numeric values match the vanilla reference 1:1.
 * `STORAGE_KEY` is a placeholder; consumers should override it per-essay.
 */
export const DEFAULT_CONFIG: MemoryGraphConfig = {
  DWELL_MS: 3000,
  BAND_RATIO: 0.4,
  STORAGE_KEY: 'mg:default',

  GRAPH_PADDING_TOP: 40,
  GRAPH_PADDING_BOTTOM: 40,
  GRAPH_PADDING_X: 40,
  MIN_NODE_SEPARATION_Y: 34,
  CENTER_X_RATIO: 0.5,
  NODE_OFFSET_X: 28,
  RETURN_BEND: 70,

  NODE_R_MIN: 5,
  NODE_R_MAX: 14,
  PASSAGE_R: 3.5,
};
