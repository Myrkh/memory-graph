import { useEffect, type RefObject } from 'react';
import type { Annotation, AnnotationId } from '../types.js';
import {
  applyBlockAnnotation,
  clearAnnotations,
  wrapAnnotationRange,
} from '../internal/annotation-dom.js';

export interface UseZoneAnnotationsOptions {
  /** Live annotation map from reducer state. */
  annotations: Map<AnnotationId, Annotation>;
  /** Id of the annotation to transiently flash (span / block), or null. */
  flashAnnotationId: AnnotationId | null;
  /** Id of the annotation currently hovered — drives the counterpart outline. */
  hoveredAnnotationId: AnnotationId | null;
}

/**
 * Imperative annotation rendering for a zone element — runs on every
 * `state.annotations` change and wraps ranges in `<mark>` (text scope)
 * or sets `data-mg-annotated="block"` (block scope) on every
 * `[data-mg-id]` descendant. No Paragraph wrapper required: a raw
 * `<aside data-mg-id>` gets the same treatment as `<p data-mg-id>`.
 *
 * Split into three effects so each one has the right dep set and can
 * re-run only when its signal changes:
 * 1. rendering — rebuilds marks/blocks on annotations change
 * 2. flash — toggles `data-mg-flash` on every mark sharing the flash id
 * 3. counterpart — toggles `data-mg-link-counterpart` on linked marks
 *    when an annotation is hovered
 */
export function useZoneAnnotations(
  zoneRef: RefObject<HTMLElement | null>,
  options: UseZoneAnnotationsOptions,
): void {
  const { annotations, flashAnnotationId, hoveredAnnotationId } = options;

  /* -- 1 · Render marks + block attrs -------------------------------- */

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    clearAnnotations(zone);

    const byPara = new Map<string, Annotation[]>();
    for (const a of annotations.values()) {
      const list = byPara.get(a.paraId) ?? [];
      list.push(a);
      byPara.set(a.paraId, list);
    }

    for (const [paraId, anns] of byPara) {
      const el = zone.querySelector<HTMLElement>(
        `[data-mg-id="${CSS.escape(paraId)}"]`,
      );
      if (!el) continue;
      // createdAt order: if two blocks collide on one element, the newest
      // overwrites `data-mg-annotation-id` (single id wins).
      const sorted = [...anns].sort((a, b) => a.createdAt - b.createdAt);
      for (const a of sorted) {
        if (a.scope === 'block') applyBlockAnnotation(el, a);
        else wrapAnnotationRange(el, a);
      }
    }
  }, [zoneRef, annotations]);

  /* -- 2 · Flash toggling -------------------------------------------- */

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const prev = zone.querySelectorAll<HTMLElement>(
      '[data-mg-annotation-id][data-mg-flash]',
    );
    prev.forEach((el) => el.removeAttribute('data-mg-flash'));
    if (!flashAnnotationId) return;
    const targets = zone.querySelectorAll<HTMLElement>(
      `[data-mg-annotation-id="${CSS.escape(flashAnnotationId)}"]`,
    );
    targets.forEach((el) => el.setAttribute('data-mg-flash', ''));
  }, [zoneRef, flashAnnotationId, annotations]);

  /* -- 3 · Link counterpart outline ---------------------------------- */

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const previous = zone.querySelectorAll<HTMLElement>(
      '[data-mg-annotation-id][data-mg-link-counterpart]',
    );
    previous.forEach((el) => el.removeAttribute('data-mg-link-counterpart'));
    if (!hoveredAnnotationId) return;
    const ann = annotations.get(hoveredAnnotationId);
    if (!ann) return;
    for (const linkedId of ann.links) {
      const marks = zone.querySelectorAll<HTMLElement>(
        `[data-mg-annotation-id="${CSS.escape(linkedId)}"]`,
      );
      marks.forEach((el) => el.setAttribute('data-mg-link-counterpart', ''));
    }
  }, [zoneRef, hoveredAnnotationId, annotations]);
}
