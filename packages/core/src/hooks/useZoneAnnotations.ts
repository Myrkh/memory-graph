import { useEffect } from 'react';
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
 * Imperative annotation rendering for every `[data-mg-id]` descendant of
 * `zone` — wraps ranges in `<mark>` (text scope) or stamps
 * `data-mg-annotated="block"` (block scope). No `<Paragraph>` wrapper
 * required: a raw `<aside data-mg-id>` gets the same treatment as
 * `<p data-mg-id>`, and a `<div data-mg-id>` inside any page too.
 *
 * Accepts `zone` as a live element (not a ref) so the effects re-run
 * when the zone mounts / unmounts across route changes. When `zone` is
 * `null`, falls back to `document.body` — annotation rendering then
 * covers the whole app (the right default for Provider-at-root sites
 * that mark content outside any `<Zone>`).
 *
 * Three effects so each has the right dep set:
 * 1. rendering — rebuilds marks/blocks on annotations change
 * 2. flash — toggles `data-mg-flash` on marks sharing the flash id
 * 3. counterpart — toggles `data-mg-link-counterpart` on linked marks
 */
export function useZoneAnnotations(
  zone: HTMLElement | null,
  options: UseZoneAnnotationsOptions,
): void {
  const { annotations, flashAnnotationId, hoveredAnnotationId } = options;

  /* -- 1 · Render marks + block attrs -------------------------------- */

  useEffect(() => {
    const root = zone ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    clearAnnotations(root);

    const byPara = new Map<string, Annotation[]>();
    for (const a of annotations.values()) {
      const list = byPara.get(a.paraId) ?? [];
      list.push(a);
      byPara.set(a.paraId, list);
    }

    for (const [paraId, anns] of byPara) {
      const el = root.querySelector<HTMLElement>(
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
  }, [zone, annotations]);

  /* -- 2 · Flash toggling -------------------------------------------- */

  useEffect(() => {
    const root = zone ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;
    const prev = root.querySelectorAll<HTMLElement>(
      '[data-mg-annotation-id][data-mg-flash]',
    );
    prev.forEach((el) => el.removeAttribute('data-mg-flash'));
    if (!flashAnnotationId) return;
    const targets = root.querySelectorAll<HTMLElement>(
      `[data-mg-annotation-id="${CSS.escape(flashAnnotationId)}"]`,
    );
    targets.forEach((el) => el.setAttribute('data-mg-flash', ''));
  }, [zone, flashAnnotationId, annotations]);

  /* -- 3 · Link counterpart outline ---------------------------------- */

  useEffect(() => {
    const root = zone ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;
    const previous = root.querySelectorAll<HTMLElement>(
      '[data-mg-annotation-id][data-mg-link-counterpart]',
    );
    previous.forEach((el) => el.removeAttribute('data-mg-link-counterpart'));
    if (!hoveredAnnotationId) return;
    const ann = annotations.get(hoveredAnnotationId);
    if (!ann) return;
    for (const linkedId of ann.links) {
      const marks = root.querySelectorAll<HTMLElement>(
        `[data-mg-annotation-id="${CSS.escape(linkedId)}"]`,
      );
      marks.forEach((el) => el.setAttribute('data-mg-link-counterpart', ''));
    }
  }, [zone, hoveredAnnotationId, annotations]);
}
