import { useEffect, useRef } from 'react';
import { resolveSelection, type ResolvedSelection } from '../internal/selection-offsets.js';

export interface UseTextSelectionOptions {
  /**
   * Reject selections shorter than this (default 4). Prevents accidental
   * micro-selections from opening the toolbar while reading.
   */
  minChars?: number;
  /**
   * Called when the user releases the mouse after making a qualifying
   * selection. Also called with `null` when the selection is cleared
   * (click elsewhere, Escape, …).
   */
  onSelect: (selection: ResolvedSelection | null) => void;
}

/**
 * Observes text selection inside `zone` and emits a resolved offset pair on
 * every qualifying mouseup / keyup. Cross-paragraph and short selections are
 * rejected (spec §03 acceptance criteria).
 *
 * Accepts the zone as a live element (not a ref) so the effect re-subscribes
 * when the zone mounts/unmounts. When `zone` is `null`, falls back to
 * `document.body` — text selection still works, scoped by `[data-mg-id]`
 * ancestry inside `resolveSelection`.
 */
export function useTextSelection(
  zone: HTMLElement | null,
  options: UseTextSelectionOptions,
): void {
  const { minChars = 4 } = options;
  const onSelectRef = useRef(options.onSelect);
  onSelectRef.current = options.onSelect;

  useEffect(() => {
    const root = zone ?? (typeof document !== 'undefined' ? document.body : null);
    if (!root) return;

    const check = (): void => {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      const resolved = resolveSelection(sel, { zone: root, minChars });
      onSelectRef.current(resolved);
    };

    const onMouseUp = (e: MouseEvent): void => {
      const target = e.target;
      if (!(target instanceof Node) || !root.contains(target)) return;
      window.setTimeout(check, 0);
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onSelectRef.current(null);
        return;
      }
      if (e.shiftKey || (e.metaKey && e.key.toLowerCase() === 'a')) check();
    };

    const onSelectionChange = (): void => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) onSelectRef.current(null);
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [zone, minChars]);
}

export type { ResolvedSelection } from '../internal/selection-offsets.js';
