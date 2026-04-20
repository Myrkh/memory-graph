import { type ElementType, type ReactNode } from 'react';
import type { NodeKind, NodeStrategy } from '../types.js';
import { useMemoryGraphContext } from './context.js';

export interface ParagraphProps {
  /** Unique id — written as `data-mg-id` for observation + annotation anchoring. */
  id: string;
  /** Element tag to render (default: `p`). Use `as="aside"`, `as="blockquote"`, `as="figure"`…
   * for any block the consumer wants to observe or annotate. */
  as?: ElementType;
  /** Children. Plain text or arbitrary JSX — annotation rendering lives in `<Zone>`,
   * not here, so nested markup (`<em>`, `<code>`, `<ul>`…) is fully supported. */
  children: ReactNode;
  className?: string;
  /**
   * Capture strategy for this element — forwarded as `data-mg-strategy`.
   * Omit for the default viewport strategy (reading-mode dwell) or to let
   * smart inference pick click/focus based on the tag.
   */
  strategy?: NodeStrategy;
  /**
   * Per-element dwell override in ms — forwarded as `data-mg-dwell`.
   * Respected by hover and focus strategies (viewport uses the global
   * `DWELL_MS`; click commits immediately).
   */
  dwell?: number;
  /**
   * Visual kind of the node in the graph — forwarded as `data-mg-kind`.
   * Omit to let smart inference pick from tagName (h1 → heading, figure →
   * figure, pre → code, else paragraph). Set explicitly for `kpi`.
   */
  kind?: NodeKind;
}

/**
 * Thin, semantic wrapper that stamps `data-mg-*` attributes on a block
 * element and wires it to library state (`data-mg-pinned`,
 * `data-mg-flash`). All annotation rendering — inline marks AND block
 * treatments — is handled uniformly by `<Zone>` for every `[data-mg-id]`
 * descendant, whether it was authored with this primitive or with a raw
 * `<aside data-mg-id>`. Equivalent output; Paragraph exists purely for
 * ergonomic pin/flash state plumbing.
 */
export function Paragraph(props: ParagraphProps) {
  const { id, as: Tag = 'p', children, className, strategy, dwell, kind } = props;
  const { state, flashParaId } = useMemoryGraphContext();

  const node = state.nodes.get(id);

  const pinnedAttr = node?.pinned ? { 'data-mg-pinned': '' } : {};
  const flashAttr = flashParaId === id ? { 'data-mg-flash': '' } : {};
  const strategyAttr = strategy ? { 'data-mg-strategy': strategy } : {};
  const dwellAttr = dwell ? { 'data-mg-dwell': String(dwell) } : {};
  const kindAttr = kind ? { 'data-mg-kind': kind } : {};

  return (
    <Tag
      className={className}
      data-mg-id={id}
      {...strategyAttr}
      {...dwellAttr}
      {...kindAttr}
      {...pinnedAttr}
      {...flashAttr}
    >
      {children}
    </Tag>
  );
}
