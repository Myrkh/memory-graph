import { useEffect, useRef, type RefObject } from 'react';
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
 * Observes text selection inside `zoneRef.current` and emits a resolved
 * offset pair on every qualifying mouseup / keyup. Cross-paragraph and
 * short selections are rejected (spec §03 acceptance criteria).
 */
export function useTextSelection(
  zoneRef: RefObject<HTMLElement | null>,
  options: UseTextSelectionOptions,
): void {
  const { minChars = 4 } = options;
  const onSelectRef = useRef(options.onSelect);
  onSelectRef.current = options.onSelect;

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const check = (): void => {
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      const resolved = resolveSelection(sel, { zone, minChars });
      onSelectRef.current(resolved);
    };

    const onMouseUp = (e: MouseEvent): void => {
      const target = e.target;
      if (!(target instanceof Node) || !zone.contains(target)) return;
      // Let the browser finalise the selection before reading it.
      window.setTimeout(check, 0);
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onSelectRef.current(null);
        return;
      }
      // Shift-arrow-keys / Cmd-A selections.
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
  }, [zoneRef, minChars]);
}

export type { ResolvedSelection } from '../internal/selection-offsets.js';
