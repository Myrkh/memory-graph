import { type ReactNode } from 'react';

export interface BottomDrawerProps {
  children: ReactNode;
  label?: string;
}

/**
 * Bottom drawer · a narrow-sidepanel affordance that hides secondary
 * controls (IntensitySparkline + Footer buttons) behind a chevron
 * handle at the panel's bottom edge. The graph gets ~70 extra vertical
 * pixels, secondary actions stay one-hover-away.
 *
 * Animation : `grid-template-rows: auto 0fr → auto 1fr` so the body
 * height animates smoothly based on its OWN content, no magic numbers.
 * Chevron rotates 180° on open. Discreet 3s opacity pulse when closed
 * hints at the reveal (Rams #4 — makes the product understandable).
 *
 * Trigger : CSS-only via `:hover` / `:focus-within` on the drawer
 * wrapper. Keyboard-complete — Tab to the handle reveals, Tab further
 * into the body keeps it open. `prefers-reduced-motion` disables all
 * transitions + pins the drawer open so nothing is hidden.
 */
export function BottomDrawer({
  children,
  label = 'Additional controls',
}: BottomDrawerProps) {
  return (
    <div className="mgx-drawer" role="region" aria-label={label}>
      <button
        type="button"
        className="mgx-drawer__handle"
        aria-label="Reveal additional controls"
      >
        <svg
          viewBox="0 0 24 10"
          className="mgx-drawer__chevron"
          aria-hidden
          focusable="false"
        >
          <path d="M 5 7 L 12 2.5 L 19 7" />
        </svg>
      </button>
      <div className="mgx-drawer__body">
        <div className="mgx-drawer__body-inner">{children}</div>
      </div>
    </div>
  );
}
