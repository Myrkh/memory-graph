import { useMemoryGraphContext } from '../primitives/context.js';
import type { ParagraphId } from '../types.js';

export interface UseMemoryGraphHoverReturn {
  /**
   * Identity of the hovered node for Innovation 02 · bidirectional hover.
   * Set either from the graph side (mouseenter on a node) or from the
   * article side (mouseover on a `[data-mg-id]` paragraph).
   */
  hoveredNodeId: ParagraphId | null;
  /**
   * Set the hovered node. Only accepts non-null ids while the panel is
   * open — attempting to set one while closed is a no-op so the reader is
   * never disturbed.
   */
  setHoveredNode: (id: ParagraphId | null) => void;
}

/**
 * Read/write the bidirectional-hover state. Exposed for consumers who want
 * to implement custom highlighting (e.g. outside the `<Zone>` tree, on a
 * custom `<ol>` of linked references, etc.). The default primitives
 * (`Zone` + `Graph`) already wire this up transparently.
 */
export function useMemoryGraphHover(): UseMemoryGraphHoverReturn {
  const { hoveredNodeId, setHoveredNode } = useMemoryGraphContext();
  return { hoveredNodeId, setHoveredNode };
}
