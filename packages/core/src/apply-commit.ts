/**
 * Pure helper for applying a commit to a serialized graph — available to
 * non-React consumers (extension service workers, SSR pipelines, Node
 * scripts). Wraps the internal reducer with a high-level signature so
 * callers never touch `ReducerState` directly.
 *
 * The only state the caller manages is the `SerializedGraph` persisted
 * in their storage layer. A commit reads the current graph, applies the
 * same pure transition a React `<Root>` would apply, and returns the
 * new graph ready to be written back.
 */

import { initialReducerState, reducer } from './internal/reducer.js';
import { serializeGraph } from './internal/serialize.js';
import {
  DEFAULT_CONFIG,
  type MemoryGraphConfig,
  type NodeKind,
  type ParagraphId,
  type SerializedGraph,
} from './types.js';

export interface CommitInput {
  paraId: ParagraphId;
  dwellMs: number;
  textContent: string;
  /** Epoch ms at which the dwell closed. `Date.now()` in the common case. */
  now: number;
  /** Visual kind of the element. Written on first promotion, immutable after. */
  kind?: NodeKind;
  /** Abstract route bucket. Stored on the node ; birth-route is immutable. */
  route?: string;
  /** Site bucket (one level above route). Same birth-immutable semantics. */
  site?: string;
}

/**
 * Apply a commit to a graph.
 *
 * - `graph` is the current persisted state, or `null` for a fresh start.
 * - `commit` carries the dwell + metadata captured by the tracker.
 * - `config` defaults to `DEFAULT_CONFIG` ; supply a partial override to
 *   adjust thresholds like `DWELL_MS`.
 *
 * Returns a new `SerializedGraph` — the old one is not mutated.
 */
export function applyCommit(
  graph: SerializedGraph | null,
  commit: CommitInput,
  config: MemoryGraphConfig = DEFAULT_CONFIG,
): SerializedGraph {
  let state = initialReducerState();
  if (graph) state = reducer(state, { type: 'restore', data: graph }, config);

  const next = reducer(
    state,
    {
      type: 'commit',
      paraId: commit.paraId,
      dwellMs: commit.dwellMs,
      textContent: commit.textContent,
      now: commit.now,
      ...(commit.kind !== undefined ? { kind: commit.kind } : {}),
      ...(commit.route !== undefined ? { route: commit.route } : {}),
      ...(commit.site !== undefined ? { site: commit.site } : {}),
    },
    config,
  );

  return serializeGraph(next.graph);
}
