import { useMemo, type ElementType, type ReactNode } from 'react';
import type { Annotation } from '../types.js';
import { useMemoryGraphContext } from './context.js';

export interface ParagraphProps {
  /** Unique id — written as `data-mg-id` for observation + annotation anchoring. */
  id: string;
  /** Element tag to render (default: `p`). */
  as?: ElementType;
  /** Plain string text. Nested React elements are not supported in v0.3 (offsets would drift). */
  children: string;
  className?: string;
}

/**
 * Opt-in paragraph primitive. Compared with a raw `<p data-mg-id>`, this
 * component wires the library-managed state into the DOM automatically:
 *
 * - `data-mg-pinned` when the corresponding station is pinned
 * - `data-mg-flash` when a flash has been triggered by a graph-node click
 * - `<mark class="mg-annotation">` wrappers around each annotation range
 *
 * Bidirectional hover (`data-mg-highlight`) is still managed imperatively
 * by `<Zone>` — it works for raw `<p data-mg-id>` as well as for this
 * primitive without conflict.
 */
export function Paragraph(props: ParagraphProps) {
  const { id, as: Tag = 'p', children, className } = props;
  const { state, flashParaId, flashAnnotationId } = useMemoryGraphContext();

  const node = state.nodes.get(id);
  const annotations = useMemo(() => {
    const out: Annotation[] = [];
    for (const a of state.annotations.values()) {
      if (a.paraId === id) out.push(a);
    }
    out.sort((a, b) => a.selection.offsetStart - b.selection.offsetStart);
    return out;
  }, [state.annotations, id]);

  const pinnedAttr = node?.pinned ? { 'data-mg-pinned': '' } : {};
  const flashAttr = flashParaId === id ? { 'data-mg-flash': '' } : {};

  return (
    <Tag className={className} data-mg-id={id} {...pinnedAttr} {...flashAttr}>
      {renderWithAnnotations(children, annotations, flashAnnotationId)}
    </Tag>
  );
}

function renderWithAnnotations(
  text: string,
  annotations: Annotation[],
  flashAnnotationId: string | null,
): ReactNode[] {
  if (annotations.length === 0) return [text];
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const a of annotations) {
    const { offsetStart, offsetEnd } = a.selection;
    if (offsetStart < cursor) continue; // overlapping → skip later entry
    if (offsetStart > cursor) parts.push(text.slice(cursor, offsetStart));
    const linkAttr = a.links.length > 0 ? { 'data-mg-has-link': '' } : {};
    const flashAttr = flashAnnotationId === a.id ? { 'data-mg-flash': '' } : {};
    parts.push(
      <mark
        key={a.id}
        className="mg-annotation"
        data-mg-annotation-id={a.id}
        {...linkAttr}
        {...flashAttr}
      >
        {text.slice(offsetStart, offsetEnd)}
      </mark>,
    );
    cursor = offsetEnd;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
