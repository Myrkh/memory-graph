import { useEffect } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface KeyboardShortcutsProps {
  /**
   * Key (case-insensitive) that toggles the panel when pressed with the
   * platform modifier (⌘ on macOS, Ctrl elsewhere). Default: 'm'.
   */
  togglePanelKey?: string;
  /**
   * Key (case-insensitive) that toggles the pin on the currently centered
   * paragraph. Default: 'p'. Set to `null` to disable.
   */
  pinKey?: string | null;
  /**
   * Whether Escape closes the panel when open. Default: `true`.
   */
  enableEscape?: boolean;
  /**
   * Message shown in the pin toast when a paragraph is pinned.
   */
  pinnedMessage?: string;
  /**
   * Message shown when a pin is removed.
   */
  unpinnedMessage?: string;
}

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Installs global keyboard shortcuts while mounted. Renders nothing.
 *
 * - ⌘M / Ctrl+M → toggle panel (also ⌘? / Ctrl+Shift+? mirror the vanilla)
 * - P → toggle pin on the currently centered paragraph (+ toast)
 * - Escape → close the panel when open
 */
export function KeyboardShortcuts(props: KeyboardShortcutsProps) {
  const {
    togglePanelKey = 'm',
    pinKey = 'p',
    enableEscape = true,
    pinnedMessage = 'Paragraph pinned',
    unpinnedMessage = 'Pin removed',
  } = props;

  const {
    open,
    togglePanel,
    closePanel,
    currentParaId,
    zoneElement,
    state,
    actions,
    showToast,
  } = useMemoryGraphContext();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && INPUT_TAGS.has(active.tagName)) return;

      const lowerKey = e.key.toLowerCase();

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && lowerKey === togglePanelKey) {
        e.preventDefault();
        togglePanel();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        togglePanel();
        return;
      }

      if (pinKey && lowerKey === pinKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!currentParaId) return;
        e.preventDefault();
        const root = zoneElement ?? document.body;
        const el = root.querySelector<HTMLElement>(
          `[data-mg-id="${CSS.escape(currentParaId)}"]`,
        );
        const text = el?.textContent ?? '';
        const wasPinned = state.nodes.get(currentParaId)?.pinned ?? false;
        actions.togglePin(currentParaId, text);
        showToast(wasPinned ? unpinnedMessage : pinnedMessage);
        return;
      }

      if (enableEscape && e.key === 'Escape' && open) {
        closePanel();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    togglePanelKey,
    pinKey,
    enableEscape,
    pinnedMessage,
    unpinnedMessage,
    open,
    togglePanel,
    closePanel,
    currentParaId,
    zoneElement,
    state,
    actions,
    showToast,
  ]);

  return null;
}
