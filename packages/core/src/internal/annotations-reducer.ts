/**
 * Annotation-specific reducer cases. Split from `internal/reducer.ts` so the
 * core reducer stays focused on the reading loop (commit / pin / clear /
 * restore / toggleShowPassages) and each file stays under 300 lines.
 *
 * All links are **bidirectional and symmetric** — `addLink(a, b)` appends
 * `b` to `a.links` AND `a` to `b.links`. The spec is explicit (Innovation
 * 04): "reading connections are mutual".
 */

import type { Annotation, AnnotationId } from '../types.js';
import type { ReducerState } from './reducer.js';

export type AnnotationAction =
  | { type: 'addAnnotation'; annotation: Annotation }
  | { type: 'updateAnnotation'; id: AnnotationId; patch: Partial<Pick<Annotation, 'note'>> }
  | { type: 'removeAnnotation'; id: AnnotationId }
  | { type: 'addAnnotationWithLink'; annotation: Annotation; linkTo: AnnotationId }
  | { type: 'addAnnotationLink'; from: AnnotationId; to: AnnotationId }
  | { type: 'removeAnnotationLink'; from: AnnotationId; to: AnnotationId };

export function applyAnnotationAction(
  state: ReducerState,
  action: AnnotationAction,
): ReducerState {
  switch (action.type) {
    case 'addAnnotation':
      return addCase(state, action.annotation);
    case 'updateAnnotation':
      return updateCase(state, action.id, action.patch);
    case 'removeAnnotation':
      return removeCase(state, action.id);
    case 'addAnnotationWithLink':
      return addWithLinkCase(state, action.annotation, action.linkTo);
    case 'addAnnotationLink':
      return linkCase(state, action.from, action.to);
    case 'removeAnnotationLink':
      return unlinkCase(state, action.from, action.to);
  }
}

/* -- Helpers ---------------------------------------------------------- */

function withAnnotations(
  state: ReducerState,
  annotations: Map<AnnotationId, Annotation>,
): ReducerState {
  return { ...state, graph: { ...state.graph, annotations } };
}

function clone(map: Map<AnnotationId, Annotation>): Map<AnnotationId, Annotation> {
  return new Map(map);
}

function appendLink(existing: Annotation, newLink: AnnotationId): Annotation {
  if (existing.links.includes(newLink)) return existing;
  return { ...existing, links: [...existing.links, newLink] };
}

function stripLink(existing: Annotation, gone: AnnotationId): Annotation {
  if (!existing.links.includes(gone)) return existing;
  return { ...existing, links: existing.links.filter((id) => id !== gone) };
}

/* -- Cases ------------------------------------------------------------ */

function addCase(state: ReducerState, annotation: Annotation): ReducerState {
  const annotations = clone(state.graph.annotations);
  annotations.set(annotation.id, annotation);
  return withAnnotations(state, annotations);
}

function updateCase(
  state: ReducerState,
  id: AnnotationId,
  patch: Partial<Pick<Annotation, 'note'>>,
): ReducerState {
  const existing = state.graph.annotations.get(id);
  if (!existing) return state;
  const annotations = clone(state.graph.annotations);
  annotations.set(id, { ...existing, ...patch });
  return withAnnotations(state, annotations);
}

function removeCase(state: ReducerState, id: AnnotationId): ReducerState {
  if (!state.graph.annotations.has(id)) return state;
  const annotations = clone(state.graph.annotations);
  annotations.delete(id);
  // Scrub inbound links — future-proof for Innovation 04 and beyond.
  for (const [otherId, other] of annotations) {
    if (other.links.includes(id)) {
      annotations.set(otherId, stripLink(other, id));
    }
  }
  return withAnnotations(state, annotations);
}

function addWithLinkCase(
  state: ReducerState,
  annotation: Annotation,
  linkTo: AnnotationId,
): ReducerState {
  const target = state.graph.annotations.get(linkTo);
  if (!target) return addCase(state, annotation);

  const annotations = clone(state.graph.annotations);
  // The new annotation carries a single forward link.
  annotations.set(annotation.id, {
    ...annotation,
    links: annotation.links.includes(linkTo) ? annotation.links : [...annotation.links, linkTo],
  });
  // The target gains the reverse link.
  annotations.set(linkTo, appendLink(target, annotation.id));
  return withAnnotations(state, annotations);
}

function linkCase(
  state: ReducerState,
  fromId: AnnotationId,
  toId: AnnotationId,
): ReducerState {
  if (fromId === toId) return state;
  const from = state.graph.annotations.get(fromId);
  const to = state.graph.annotations.get(toId);
  if (!from || !to) return state;
  if (from.links.includes(toId) && to.links.includes(fromId)) return state;

  const annotations = clone(state.graph.annotations);
  annotations.set(fromId, appendLink(from, toId));
  annotations.set(toId, appendLink(to, fromId));
  return withAnnotations(state, annotations);
}

function unlinkCase(
  state: ReducerState,
  fromId: AnnotationId,
  toId: AnnotationId,
): ReducerState {
  const from = state.graph.annotations.get(fromId);
  const to = state.graph.annotations.get(toId);
  if (!from || !to) return state;
  if (!from.links.includes(toId) && !to.links.includes(fromId)) return state;

  const annotations = clone(state.graph.annotations);
  annotations.set(fromId, stripLink(from, toId));
  annotations.set(toId, stripLink(to, fromId));
  return withAnnotations(state, annotations);
}
