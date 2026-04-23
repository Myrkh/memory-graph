/**
 * Pure serialization helpers for the graph state. Turns the runtime
 * `GraphState` (with `Map`s) into the JSON-safe `SerializedGraph` the
 * storage layer expects, and back. Used internally by `usePersistence`
 * and exposed publicly so non-React consumers (workers, Node scripts,
 * Electron) can round-trip state without pulling React into their scope.
 */

import {
  CURRENT_SCHEMA_VERSION,
  type GraphState,
  type SerializedGraph,
} from '../types.js';

export function serializeGraph(state: GraphState): SerializedGraph {
  return {
    version: CURRENT_SCHEMA_VERSION,
    nodes: [...state.nodes.entries()],
    edges: state.edges.slice(),
    passages: [...state.passages.entries()],
    annotations: [...state.annotations.values()],
    intensityBuckets: state.intensityBuckets.slice(),
  };
}

export function deserializeGraph(serialized: SerializedGraph): GraphState {
  return {
    nodes: new Map(serialized.nodes),
    edges: serialized.edges.slice(),
    passages: new Map(serialized.passages),
    annotations: new Map(serialized.annotations.map((a) => [a.id, a])),
    intensityBuckets: serialized.intensityBuckets.slice(),
  };
}
