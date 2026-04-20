import type { MemoryGraphConfig, NodeKind, ParagraphId } from '../types.js';
import type { StrategyInference } from '../internal/strategy-inference.js';
import type { KindInference } from '../internal/kind-inference.js';
import { useViewportStrategy } from './useViewportStrategy.js';
import { useHoverStrategy } from './useHoverStrategy.js';
import { useClickStrategy } from './useClickStrategy.js';
import { useFocusStrategy } from './useFocusStrategy.js';

export interface UseAttentionTrackerOptions {
  /** Slice of the config actually consumed by the tracker. */
  config: Pick<MemoryGraphConfig, 'DWELL_MS' | 'BAND_RATIO'>;
  /**
   * Called whenever a paragraph loses the "centered" focus (viewport strategy),
   * stays hovered long enough (hover strategy), is clicked (click strategy),
   * or holds focus long enough (focus strategy). Every strategy ultimately
   * converges on this single callback.
   */
  onCommit: (
    paraId: ParagraphId,
    dwellMs: number,
    textContent: string,
    kind?: NodeKind,
    route?: string,
  ) => void;
  /** Default dwell for hover strategy, overridable per-element via `data-mg-dwell`. Default 1500. */
  hoverDwellMs?: number;
  /** Default dwell for focus strategy, overridable per-element via `data-mg-dwell`. Default 1500. */
  focusDwellMs?: number;
  /**
   * How to decide the strategy of an element when it has no
   * `data-mg-strategy` attribute.
   *
   * - `'smart'` (default): infer from `tagName` and ARIA role —
   *   `<button>`/`<a>` → click, `<input>`/`<textarea>` → focus,
   *   everything else → viewport. Zero-annotation ergonomics, ideal for
   *   "wrap the app once" scenarios (extension, dashboard).
   * - `'explicit'`: always fall back to `viewport`. Annotate every
   *   non-viewport element with `data-mg-strategy="…"` yourself. Use
   *   when you want strict, predictable control.
   */
  strategyInference?: StrategyInference;
  /**
   * How to decide the visual kind of an element when it has no
   * `data-mg-kind` attribute.
   *
   * - `'smart'` (default): infer from `tagName` — `<h1>`-`<h6>` → heading,
   *   `<figure>`/`<img>` → figure, `<pre>` → code, rest → paragraph.
   * - `'explicit'`: always fall back to `paragraph`. Set `data-mg-kind`
   *   per element for total control over graph geometry.
   */
  kindInference?: KindInference;
  /**
   * Abstract "route" bucket stamped on every committed node — whatever
   * the consumer passes via `<MemoryGraph.Root route="…">`. Agnostic of
   * any routing library (URL path, tab id, doc id, mode name…). Drives
   * the 2D column layout in `<Graph>` when two or more unique routes are
   * present in state.
   */
  route?: string;
}

export interface UseAttentionTrackerReturn {
  /** Paragraph currently centered in the viewport band (viewport strategy only), or `null`. */
  currentParaId: ParagraphId | null;
}

const DEFAULT_HOVER_DWELL_MS = 1500;
const DEFAULT_FOCUS_DWELL_MS = 1500;

/**
 * Composes the four capture strategies (viewport · hover · click · focus)
 * and routes each tracked element to the right observer. Default
 * `'smart'` inference means an element's strategy is resolved from its
 * semantic tagName when `data-mg-strategy` is absent — so a `<button
 * data-mg-id="x">` is treated as click without the consumer spelling it
 * out. All strategies converge on `onCommit`.
 *
 * Accepts the container as a live element (not a ref) so each strategy
 * re-subscribes when the zone mounts/unmounts. When `container` is `null`,
 * falls back to `document.body` — enables zero-Zone dashboards.
 *
 * Manual tracking is not a strategy: call `actions.commit(id, ms, text)`
 * directly from consumer code.
 */
export function useAttentionTracker(
  container: HTMLElement | null,
  options: UseAttentionTrackerOptions,
): UseAttentionTrackerReturn {
  const {
    config,
    onCommit,
    hoverDwellMs = DEFAULT_HOVER_DWELL_MS,
    focusDwellMs = DEFAULT_FOCUS_DWELL_MS,
    strategyInference = 'smart',
    kindInference = 'smart',
    route,
  } = options;

  const viewportOpts = {
    config,
    onCommit,
    inference: strategyInference,
    kindInference,
    ...(route !== undefined ? { route } : {}),
  };
  const hoverOpts = {
    triggerDwellMs: hoverDwellMs,
    commitDwellMs: config.DWELL_MS,
    onCommit,
    inference: strategyInference,
    kindInference,
    ...(route !== undefined ? { route } : {}),
  };
  const clickOpts = {
    commitDwellMs: config.DWELL_MS,
    onCommit,
    inference: strategyInference,
    kindInference,
    ...(route !== undefined ? { route } : {}),
  };
  const focusOpts = {
    triggerDwellMs: focusDwellMs,
    commitDwellMs: config.DWELL_MS,
    onCommit,
    inference: strategyInference,
    kindInference,
    ...(route !== undefined ? { route } : {}),
  };

  const { currentParaId } = useViewportStrategy(container, viewportOpts);
  useHoverStrategy(container, hoverOpts);
  useClickStrategy(container, clickOpts);
  useFocusStrategy(container, focusOpts);

  return { currentParaId };
}
