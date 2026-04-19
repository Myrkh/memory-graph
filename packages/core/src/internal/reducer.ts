/**
 * Pure reducer powering `useMemoryGraphState`. Exposed as an independent
 * module so tests can exercise it without rendering React.
 *
 * Every public transition matches a case in the vanilla reference
 * (packages/playground/public/reference-vanilla.html, lines 1524-1990).
 */

import type {
  Annotation,
  AnnotationId,
  Edge,
  GraphState,
  IntensityBucket,
  MemoryGraphConfig,
  Node,
  ParagraphId,
  Passage,
  SerializedGraph,
} from '../types.js';

/* -- Constants ------------------------------------------------------------ */

export const EXTRACT_LEN_STATION = 80;
export const EXTRACT_LEN_PASSAGE = 60;
export const INTENSITY_BUCKET_CAP = 60;

/* -- Helpers -------------------------------------------------------------- */

export function truncate(text: string, maxLen: number): string {
  const t = text.trim();
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}

export function emptyGraph(): GraphState {
  return {
    nodes: new Map(),
    edges: [],
    passages: new Map(),
    annotations: new Map(),
    intensityBuckets: [],
  };
}

function pushIntensity(
  buckets: IntensityBucket[],
  dwellMs: number,
  now: number,
): IntensityBucket[] {
  if (dwellMs <= 0) return buckets;
  const minuteKey = Math.floor(now / 60_000);
  const next = buckets.slice();
  const last = next[next.length - 1];
  if (last && last.m === minuteKey) {
    next[next.length - 1] = { m: last.m, s: last.s + dwellMs / 1000 };
  } else {
    next.push({ m: minuteKey, s: dwellMs / 1000 });
    if (next.length > INTENSITY_BUCKET_CAP) next.shift();
  }
  return next;
}

/* -- State + actions ------------------------------------------------------ */

export interface ReducerState {
  graph: GraphState;
  previousStationId: ParagraphId | null;
  showPassages: boolean;
}

export function initialReducerState(): ReducerState {
  return {
    graph: emptyGraph(),
    previousStationId: null,
    showPassages: false,
  };
}

export type Action =
  | { type: 'commit'; paraId: ParagraphId; dwellMs: number; textContent: string; now: number }
  | { type: 'togglePin'; paraId: ParagraphId; textContent: string; now: number }
  | { type: 'clear' }
  | { type: 'restore'; data: SerializedGraph }
  | { type: 'toggleShowPassages' }
  | { type: 'addAnnotation'; annotation: Annotation }
  | { type: 'updateAnnotation'; id: AnnotationId; patch: Partial<Pick<Annotation, 'note'>> }
  | { type: 'removeAnnotation'; id: AnnotationId };

/* -- Reducer -------------------------------------------------------------- */

export function reducer(
  state: ReducerState,
  action: Action,
  config: MemoryGraphConfig,
): ReducerState {
  switch (action.type) {
    case 'commit':
      return commitCase(state, action, config);
    case 'togglePin':
      return togglePinCase(state, action);
    case 'clear':
      return { graph: emptyGraph(), previousStationId: null, showPassages: state.showPassages };
    case 'restore':
      return restoreCase(state, action.data);
    case 'toggleShowPassages':
      return { ...state, showPassages: !state.showPassages };
    case 'addAnnotation':
      return addAnnotationCase(state, action.annotation);
    case 'updateAnnotation':
      return updateAnnotationCase(state, action.id, action.patch);
    case 'removeAnnotation':
      return removeAnnotationCase(state, action.id);
  }
}

function addAnnotationCase(state: ReducerState, annotation: Annotation): ReducerState {
  const annotations = new Map(state.graph.annotations);
  annotations.set(annotation.id, annotation);
  return { ...state, graph: { ...state.graph, annotations } };
}

function updateAnnotationCase(
  state: ReducerState,
  id: AnnotationId,
  patch: Partial<Pick<Annotation, 'note'>>,
): ReducerState {
  const existing = state.graph.annotations.get(id);
  if (!existing) return state;
  const annotations = new Map(state.graph.annotations);
  annotations.set(id, { ...existing, ...patch });
  return { ...state, graph: { ...state.graph, annotations } };
}

function removeAnnotationCase(state: ReducerState, id: AnnotationId): ReducerState {
  if (!state.graph.annotations.has(id)) return state;
  const annotations = new Map(state.graph.annotations);
  annotations.delete(id);
  // Also drop any outbound links pointing at this id (future-proofing for Innovation 04).
  let linksTouched = false;
  for (const [otherId, other] of annotations) {
    if (other.links.includes(id)) {
      annotations.set(otherId, {
        ...other,
        links: other.links.filter((linkId) => linkId !== id),
      });
      linksTouched = true;
    }
  }
  if (!linksTouched) {
    /* no-op branch kept explicit for readability */
  }
  return { ...state, graph: { ...state.graph, annotations } };
}

function commitCase(
  state: ReducerState,
  action: Extract<Action, { type: 'commit' }>,
  config: MemoryGraphConfig,
): ReducerState {
  const { paraId, dwellMs, textContent, now } = action;
  const { graph, previousStationId } = state;

  const intensityBuckets = pushIntensity(graph.intensityBuckets, dwellMs, now);

  if (dwellMs < config.DWELL_MS) {
    if (graph.nodes.has(paraId) || graph.passages.has(paraId)) {
      return { ...state, graph: { ...graph, intensityBuckets } };
    }
    const passages = new Map(graph.passages);
    const passage: Passage = {
      firstAt: now,
      extract: truncate(textContent, EXTRACT_LEN_PASSAGE),
    };
    passages.set(paraId, passage);
    return { ...state, graph: { ...graph, passages, intensityBuckets } };
  }

  const nodes = new Map(graph.nodes);
  const existing = nodes.get(paraId);
  let nextEdges: Edge[] = graph.edges;

  if (existing) {
    nodes.set(paraId, {
      ...existing,
      totalMs: existing.totalMs + dwellMs,
      visits: existing.visits + 1,
    });
    if (previousStationId && previousStationId !== paraId) {
      nextEdges = [
        ...graph.edges,
        { from: previousStationId, to: paraId, kind: 'return', at: now },
      ];
    }
  } else {
    nodes.set(paraId, {
      order: nodes.size,
      firstAt: now,
      totalMs: dwellMs,
      visits: 1,
      pinned: false,
      extract: truncate(textContent, EXTRACT_LEN_STATION),
    });
    if (previousStationId && previousStationId !== paraId) {
      nextEdges = [
        ...graph.edges,
        { from: previousStationId, to: paraId, kind: 'forward', at: now },
      ];
    }
  }

  const passages = graph.passages.has(paraId) ? new Map(graph.passages) : graph.passages;
  if (passages !== graph.passages) passages.delete(paraId);

  return {
    ...state,
    graph: {
      nodes,
      edges: nextEdges,
      passages,
      annotations: graph.annotations,
      intensityBuckets,
    },
    previousStationId: paraId,
  };
}

function togglePinCase(
  state: ReducerState,
  action: Extract<Action, { type: 'togglePin' }>,
): ReducerState {
  const { paraId, textContent, now } = action;
  const { graph } = state;
  const nodes = new Map(graph.nodes);
  const existing = nodes.get(paraId);
  if (existing) {
    nodes.set(paraId, { ...existing, pinned: !existing.pinned });
  } else {
    nodes.set(paraId, {
      order: nodes.size,
      firstAt: now,
      totalMs: 0,
      visits: 0,
      pinned: true,
      extract: truncate(textContent, EXTRACT_LEN_STATION),
    });
  }
  return { ...state, graph: { ...graph, nodes } };
}

function restoreCase(state: ReducerState, data: SerializedGraph): ReducerState {
  const nodes = new Map<ParagraphId, Node>(data.nodes);
  const passages = new Map<ParagraphId, Passage>(data.passages);
  const annotations = new Map<AnnotationId, Annotation>();
  for (const a of data.annotations) annotations.set(a.id, a);
  let previousStationId: ParagraphId | null = null;
  let maxOrder = -1;
  for (const [id, node] of nodes) {
    if (node.order > maxOrder) {
      maxOrder = node.order;
      previousStationId = id;
    }
  }
  return {
    graph: {
      nodes,
      edges: data.edges.slice(),
      passages,
      annotations,
      intensityBuckets: data.intensityBuckets.slice(),
    },
    previousStationId,
    showPassages: state.showPassages,
  };
}
