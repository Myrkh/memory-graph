/**
 * Convert a DOM Range to character offsets inside the paragraph's
 * textContent — offsets survive reflow, font-size changes and other
 * DOM re-layouts, unlike raw Range clones.
 *
 * This module is DOM-aware but framework-agnostic.
 */

export interface ResolvedSelection {
  /** The paragraph element carrying `data-mg-id`. */
  paraElement: HTMLElement;
  /** Value of the `data-mg-id` attribute. */
  paraId: string;
  /** Selected text (as the DOM sees it — no normalization beyond the Range). */
  text: string;
  /** Character offset of selection start inside `paraElement.textContent`. */
  offsetStart: number;
  /** Character offset of selection end (exclusive). */
  offsetEnd: number;
  /** Bounding rect of the live selection, captured at resolution time. */
  rect: DOMRect;
}

/**
 * Options for {@link resolveSelection}.
 */
export interface ResolveSelectionOptions {
  /** Scoping container — only selections *inside* it are resolved. */
  zone: HTMLElement;
  /** Reject selections shorter than this many characters. Default 4. */
  minChars?: number;
}

/**
 * Resolve the current user selection to a paragraph-scoped offset pair, or
 * return `null` when any of the rejection rules fires:
 *
 * - collapsed selection (no text selected)
 * - selection outside the zone
 * - selection spanning multiple `[data-mg-id]` paragraphs
 * - selection shorter than `minChars`
 */
export function resolveSelection(
  selection: Selection | null,
  options: ResolveSelectionOptions,
): ResolvedSelection | null {
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const { zone, minChars = 4 } = options;

  if (!zone.contains(range.commonAncestorContainer)) return null;

  const startPara = findParagraphAncestor(range.startContainer, zone);
  const endPara = findParagraphAncestor(range.endContainer, zone);
  if (!startPara || !endPara || startPara !== endPara) return null;

  const text = range.toString();
  if (text.length < minChars) return null;

  const offsetStart = characterOffsetWithin(startPara, range.startContainer, range.startOffset);
  const offsetEnd = characterOffsetWithin(startPara, range.endContainer, range.endOffset);
  if (offsetStart < 0 || offsetEnd < 0 || offsetEnd <= offsetStart) return null;

  const paraId = startPara.dataset['mgId'];
  if (!paraId) return null;

  return {
    paraElement: startPara,
    paraId,
    text,
    offsetStart,
    offsetEnd,
    rect: range.getBoundingClientRect(),
  };
}

function findParagraphAncestor(node: Node, zone: HTMLElement): HTMLElement | null {
  let cursor: Node | null = node;
  while (cursor && cursor !== zone) {
    if (cursor instanceof HTMLElement && cursor.dataset['mgId']) return cursor;
    cursor = cursor.parentNode;
  }
  return null;
}

/**
 * Return the character offset at `(node, offsetInNode)` within `root`,
 * counting only text nodes under `root`. Returns -1 if `node` is not under
 * `root`.
 */
function characterOffsetWithin(
  root: HTMLElement,
  node: Node,
  offsetInNode: number,
): number {
  if (!root.contains(node)) return -1;
  let total = 0;
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) {
      return total + Math.min(offsetInNode, current.nodeValue?.length ?? 0);
    }
    total += current.nodeValue?.length ?? 0;
    current = walker.nextNode();
  }
  // If `node` is an element (Range end at element boundary), offsetInNode
  // counts child nodes. Sum up textContent lengths of the first offsetInNode
  // children.
  if (node instanceof Element && node === root) {
    let before = 0;
    for (let i = 0; i < offsetInNode && i < node.childNodes.length; i++) {
      before += node.childNodes[i]?.textContent?.length ?? 0;
    }
    return before;
  }
  return -1;
}
