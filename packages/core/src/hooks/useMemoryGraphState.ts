import { useCallback, useMemo, useReducer, useRef } from 'react';
import type {
  Annotation,
  AnnotationId,
  AnnotationScope,
  GraphState,
  MemoryGraphConfig,
  Node,
  NodeKind,
  ParagraphId,
  SerializedGraph,
} from '../types.js';
import {
  initialReducerState,
  reducer,
  type Action,
  type ReducerState,
} from '../internal/reducer.js';

/**
 * Inputs required to create a new annotation — everything except the
 * library-generated `id`, `createdAt` and initial empty `links`.
 */
export interface NewAnnotationInput {
  paraId: ParagraphId;
  selection: Annotation['selection'];
  note?: string | null;
  /** Scope of the visual treatment (`text` inline vs `block` full-card). Defaults to `text`. */
  scope?: AnnotationScope;
}

function generateAnnotationId(): AnnotationId {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return `ann-${g.crypto.randomUUID()}`;
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface MemoryGraphActions {
  /** Record dwell on a paragraph. Promotes to station when `dwellMs >= config.DWELL_MS`, otherwise logs a passage.
   * `kind` is stored on first promotion and drives the node's graph shape.
   * `route` is an abstract bucket (URL path, tab id, doc id…) driving the 2D column layout. */
  commit(
    paraId: ParagraphId,
    dwellMs: number,
    textContent: string,
    kind?: NodeKind,
    route?: string,
  ): void;
  /** Toggle the pinned flag. If the paragraph isn't yet a station, it is created with zero dwell. */
  togglePin(paraId: ParagraphId, textContent: string): void;
  /** Wipe all nodes, edges, passages, annotations and intensity buckets. */
  clear(): void;
  /** Rehydrate the graph from a serialized snapshot (localStorage, file…). */
  restore(data: SerializedGraph): void;
  /** Toggle the "show passages" rendering flag. Not persisted. */
  toggleShowPassages(): void;
  /** Create an annotation. Returns the generated id. */
  addAnnotation(input: NewAnnotationInput): AnnotationId;
  /**
   * Create an annotation AND symmetrically link it to an existing one.
   * Returns the generated id of the new annotation.
   */
  addAnnotationWithLink(input: NewAnnotationInput, linkTo: AnnotationId): AnnotationId;
  /** Patch an existing annotation's note. Returns true if the annotation existed. */
  updateAnnotationNote(id: AnnotationId, note: string | null): boolean;
  /** Delete an annotation and strip incoming links from other annotations. */
  removeAnnotation(id: AnnotationId): void;
  /** Add a bidirectional link between two existing annotations. Idempotent. */
  addAnnotationLink(from: AnnotationId, to: AnnotationId): void;
  /** Remove a bidirectional link between two annotations. Idempotent. */
  removeAnnotationLink(from: AnnotationId, to: AnnotationId): void;
}

export interface MemoryGraphDerived {
  stationCount: number;
  /** Count of `return` edges — equivalent to the vanilla "loops" metric. */
  loopCount: number;
  /** Total dwell across all stations, in ms. */
  totalMs: number;
  pinCount: number;
  /** Station with the highest `totalMs`, or null if there are none. */
  deepest: { id: ParagraphId; node: Node } | null;
}

export interface UseMemoryGraphStateReturn {
  state: GraphState;
  previousStationId: ParagraphId | null;
  showPassages: boolean;
  actions: MemoryGraphActions;
  derived: MemoryGraphDerived;
}

export function useMemoryGraphState(config: MemoryGraphConfig): UseMemoryGraphStateReturn {
  const boundReducer = useMemo(
    () => (s: ReducerState, a: Action) => reducer(s, a, config),
    [config],
  );

  const [state, dispatch] = useReducer(boundReducer, undefined, initialReducerState);

  const commit = useCallback(
    (
      paraId: ParagraphId,
      dwellMs: number,
      textContent: string,
      kind?: NodeKind,
      route?: string,
    ) => {
      dispatch({
        type: 'commit',
        paraId,
        dwellMs,
        textContent,
        now: Date.now(),
        ...(kind !== undefined ? { kind } : {}),
        ...(route !== undefined ? { route } : {}),
      });
    },
    [],
  );

  const togglePin = useCallback((paraId: ParagraphId, textContent: string) => {
    dispatch({ type: 'togglePin', paraId, textContent, now: Date.now() });
  }, []);

  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const restore = useCallback(
    (data: SerializedGraph) => dispatch({ type: 'restore', data }),
    [],
  );

  const toggleShowPassages = useCallback(() => dispatch({ type: 'toggleShowPassages' }), []);

  const stateRef = useRef(state);
  stateRef.current = state;

  const buildAnnotation = useCallback((input: NewAnnotationInput): Annotation => ({
    id: generateAnnotationId(),
    paraId: input.paraId,
    selection: input.selection,
    note: input.note ?? null,
    createdAt: Date.now(),
    links: [],
    scope: input.scope ?? 'text',
  }), []);

  const addAnnotation = useCallback((input: NewAnnotationInput): AnnotationId => {
    const annotation = buildAnnotation(input);
    dispatch({ type: 'addAnnotation', annotation });
    return annotation.id;
  }, [buildAnnotation]);

  const addAnnotationWithLink = useCallback(
    (input: NewAnnotationInput, linkTo: AnnotationId): AnnotationId => {
      const annotation = buildAnnotation(input);
      dispatch({ type: 'addAnnotationWithLink', annotation, linkTo });
      return annotation.id;
    },
    [buildAnnotation],
  );

  const updateAnnotationNote = useCallback((id: AnnotationId, note: string | null): boolean => {
    const existed = stateRef.current.graph.annotations.has(id);
    if (existed) dispatch({ type: 'updateAnnotation', id, patch: { note } });
    return existed;
  }, []);

  const removeAnnotation = useCallback((id: AnnotationId): void => {
    dispatch({ type: 'removeAnnotation', id });
  }, []);

  const addAnnotationLink = useCallback((from: AnnotationId, to: AnnotationId): void => {
    dispatch({ type: 'addAnnotationLink', from, to });
  }, []);

  const removeAnnotationLink = useCallback((from: AnnotationId, to: AnnotationId): void => {
    dispatch({ type: 'removeAnnotationLink', from, to });
  }, []);

  const actions = useMemo<MemoryGraphActions>(
    () => ({
      commit,
      togglePin,
      clear,
      restore,
      toggleShowPassages,
      addAnnotation,
      addAnnotationWithLink,
      updateAnnotationNote,
      removeAnnotation,
      addAnnotationLink,
      removeAnnotationLink,
    }),
    [
      commit,
      togglePin,
      clear,
      restore,
      toggleShowPassages,
      addAnnotation,
      addAnnotationWithLink,
      updateAnnotationNote,
      removeAnnotation,
      addAnnotationLink,
      removeAnnotationLink,
    ],
  );

  const derived = useMemo<MemoryGraphDerived>(() => {
    let totalMs = 0;
    let pinCount = 0;
    let deepest: { id: ParagraphId; node: Node } | null = null;
    for (const [id, node] of state.graph.nodes) {
      totalMs += node.totalMs;
      if (node.pinned) pinCount++;
      if (!deepest || node.totalMs > deepest.node.totalMs) deepest = { id, node };
    }
    let loopCount = 0;
    for (const e of state.graph.edges) if (e.kind === 'return') loopCount++;
    return {
      stationCount: state.graph.nodes.size,
      loopCount,
      totalMs,
      pinCount,
      deepest,
    };
  }, [state.graph]);

  return {
    state: state.graph,
    previousStationId: state.previousStationId,
    showPassages: state.showPassages,
    actions,
    derived,
  };
}
