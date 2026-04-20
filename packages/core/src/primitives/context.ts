import { createContext, useContext } from 'react';
import type {
  Annotation,
  AnnotationId,
  GraphItem,
  GraphState,
  MemoryGraphConfig,
  ParagraphId,
} from '../types.js';
import type {
  MemoryGraphActions,
  MemoryGraphDerived,
} from '../hooks/useMemoryGraphState.js';
import type { ExportMeta } from '../hooks/usePersistence.js';
import type { ResolvedSelection } from '../internal/selection-offsets.js';

/**
 * Active state for Innovation 04 · annotation linking. While non-null, the
 * page is in "linking mode": cursor is a crosshair, existing annotations
 * flash + get a target ring on hover, clicking one attaches `pendingSelection`
 * as a new annotation linked to the target.
 */
export interface LinkingMode {
  /** The selection frozen when the user clicked `→ Link`. */
  pendingSelection: ResolvedSelection;
}

/**
 * Hover payload for the graph tooltip. Carries cursor position so the
 * tooltip can follow the mouse, plus either the hovered graph item or a
 * hovered annotation (surfacing the note in italic serif).
 */
export type HoverState =
  | { kind: 'node'; item: GraphItem; clientX: number; clientY: number }
  | { kind: 'annotation'; annotation: Annotation; clientX: number; clientY: number };

/**
 * Everything the compound primitives need to read from the root.
 * Children subscribe via {@link useMemoryGraphContext}.
 */
export interface MemoryGraphContextValue {
  config: MemoryGraphConfig;

  state: GraphState;
  previousStationId: ParagraphId | null;
  showPassages: boolean;
  derived: MemoryGraphDerived;
  actions: MemoryGraphActions;

  currentParaId: ParagraphId | null;

  /** Abstract route bucket currently passed via `<Root route="…">`. `undefined` when no route is in use. */
  route: string | undefined;

  /**
   * The live `<Zone>` DOM element, or `null` if no Zone is mounted.
   *
   * State-based (not a ref) so observers can re-run when the zone mounts
   * or unmounts across route changes — critical for the Provider-at-root
   * pattern where `<Root>` persists but pages swap their `<Zone>` in and
   * out of the tree.
   *
   * When `null`, tracker + text selection fall back to `document.body`,
   * enabling zero-Zone usage for dashboards / extensions.
   */
  zoneElement: HTMLElement | null;
  /** Callback ref used by `<Zone>` to register itself. Consumers do not call this. */
  setZoneElement: (el: HTMLElement | null) => void;

  exportJson: (meta?: ExportMeta) => string;
  clearPersisted: () => void;

  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  /** id of the paragraph to transiently flash, or null. */
  flashParaId: ParagraphId | null;
  /** Trigger a flash animation on a paragraph (e.g. when a node is clicked). */
  triggerFlash: (paraId: ParagraphId) => void;

  /** Transient toast message, or null. */
  toastMessage: string | null;
  /** Show a toast for ~1.6s (mirrors the vanilla behavior). */
  showToast: (message: string) => void;

  /** The node currently being hovered on the graph, with cursor coordinates. */
  hover: HoverState | null;
  setHover: (state: HoverState | null) => void;

  /**
   * Active linking mode (Innovation 04) or null. Set by the SelectionToolbar's
   * `→ Link` button; cleared when the user picks a target, presses Escape, or
   * clicks outside any annotation.
   */
  linkingMode: LinkingMode | null;
  setLinkingMode: (mode: LinkingMode | null) => void;

  /**
   * Identity of the hovered element for the bidirectional-highlight feature
   * (Innovation 02). Set by either the graph (mouseenter on a node) or the
   * zone (mouseover on a paragraph). Cleared when the panel closes.
   *
   * Distinct from `hover`, which carries cursor coordinates for the tooltip.
   */
  hoveredNodeId: ParagraphId | null;
  /** Only accepts non-null values while the panel is open (spec §02). */
  setHoveredNode: (id: ParagraphId | null) => void;

  /**
   * Identity of the annotation currently being hovered in the text or in the
   * graph (Innovation 04 polish — on-screen link reveal). Null when nothing
   * is hovered. Ephemeral, never persisted.
   */
  hoveredAnnotationId: AnnotationId | null;
  setHoveredAnnotation: (id: AnnotationId | null) => void;

  /**
   * Annotations Track side-column open state (Innovation 04 · Track view).
   * Automatically reset to `false` when the panel itself closes, so
   * reopening the panel starts with the Track collapsed.
   */
  trackOpen: boolean;
  setTrackOpen: (open: boolean) => void;

  /**
   * Id of the annotation to transiently flash (span-level flash, not
   * paragraph-level — §Innovation 03 acceptance criterion). Cleared
   * automatically after ~1.8s.
   */
  flashAnnotationId: AnnotationId | null;
  triggerAnnotationFlash: (id: AnnotationId) => void;
}

const MemoryGraphContext = createContext<MemoryGraphContextValue | null>(null);
MemoryGraphContext.displayName = 'MemoryGraphContext';

/**
 * Read the nearest MemoryGraph.Root context.
 * Throws a descriptive error if used outside a Root.
 */
export function useMemoryGraphContext(): MemoryGraphContextValue {
  const ctx = useContext(MemoryGraphContext);
  if (!ctx) {
    throw new Error(
      '[@myrkh/memory-graph] A MemoryGraph primitive was rendered outside of <MemoryGraph.Root>.',
    );
  }
  return ctx;
}

export { MemoryGraphContext };
