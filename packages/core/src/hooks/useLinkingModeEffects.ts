import { useEffect } from 'react';
import type { LinkingMode } from '../primitives/context.js';

/**
 * Side-effects tied to the annotation-linking mode (Innovation 04):
 *
 * - Sets `data-mg-linking` on `<body>` while active (drives the global
 *   crosshair cursor + annotation pulse via CSS).
 * - Listens for Escape to cancel the mode.
 * - Listens for mousedown outside any annotation to cancel the mode.
 * - Clears the body attribute on unmount, always.
 *
 * Extracted from Root so each state concern has its own focused hook —
 * Root stays ≤ 300 lines and each feature's wiring lives in one place.
 */
export function useLinkingModeEffects(
  linkingMode: LinkingMode | null,
  setLinkingMode: (mode: LinkingMode | null) => void,
): void {
  // Body attribute mirror.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (linkingMode) body.setAttribute('data-mg-linking', '');
    else body.removeAttribute('data-mg-linking');
    return () => body.removeAttribute('data-mg-linking');
  }, [linkingMode]);

  // Escape + click-outside cancellation.
  useEffect(() => {
    if (!linkingMode) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLinkingMode(null);
      }
    };
    const onClickOutside = (e: MouseEvent): void => {
      if (!(e.target instanceof Element)) return;
      // Keep mode active if the click lands on an annotation or a satellite.
      if (e.target.closest('[data-mg-annotation-id]')) return;
      setLinkingMode(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [linkingMode, setLinkingMode]);
}
