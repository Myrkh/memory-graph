import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Trap Tab focus inside `ref.current` while `active` is true, restore
 * focus to the previously-focused element on deactivation. Intended for
 * modal dialogs (the memory-graph Panel is the canonical consumer).
 *
 * Behavior:
 * - On activate: store `document.activeElement`, move focus to the first
 *   focusable descendant of `ref.current` (or the container itself if it
 *   carries `tabindex`).
 * - While active: `Tab` / `Shift+Tab` cycle within the container.
 * - On deactivate: best-effort restore focus to the previously-focused
 *   element.
 *
 * Non-goals: escape-to-close (owned by the library's keyboard shortcuts),
 * inert scoping of the rest of the document (future, when browser support
 * is wider).
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus into the container.
    const focusables = collectFocusables(container);
    const first = focusables[0] ?? container;
    // If we're falling back to the container itself, make sure it can hold focus.
    if (first === container && !container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
    }
    requestAnimationFrame(() => {
      first.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;
      const current = collectFocusables(container);
      if (current.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const firstEl = current[0]!;
      const lastEl = current[current.length - 1]!;
      const activeEl = document.activeElement as HTMLElement | null;
      const isInside = activeEl ? container.contains(activeEl) : false;

      if (!isInside) {
        e.preventDefault();
        (e.shiftKey ? lastEl : firstEl).focus();
        return;
      }
      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const previous = previouslyFocusedRef.current;
      if (previous && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [active, ref]);
}

function collectFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}
