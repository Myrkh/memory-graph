import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

/**
 * Handle presentation variant. Three distinct *philosophies*, not three
 * values on the same cosmetic slider:
 *
 * - `permanent` — armed state is visible (opacity ~32%) whenever a station
 *   exists, becomes fully opaque on hover. Faithful to the vanilla reference.
 *   Best for reading sites that want to advertise the feature.
 *
 * - `ghost` — invisible at rest, revealed only on left-edge hover. Best for
 *   minimalist layouts where any persistent mark competes with the text.
 *
 * - `none` — the primitive renders nothing. Use this when the consumer
 *   invokes the panel exclusively via keyboard or a custom button wired to
 *   {@link useMemoryGraphContext}.openPanel.
 */
export type HandleVariant = 'permanent' | 'ghost' | 'none';

export interface HandleProps {
  /** See {@link HandleVariant}. Defaults to `'permanent'`. */
  variant?: HandleVariant;
  /** Label shown inside the accent pill when hovered. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fixed-position invocation handle at the left edge of the viewport.
 * Clicking opens the panel. The presentation is controlled by `variant`;
 * behavior is always the same.
 *
 * Styled by `styles/base/handle.css` via the `data-mg-variant` attribute.
 */
export function Handle(props: HandleProps) {
  const { variant = 'permanent', label = 'Memory Graph', className, style } = props;
  const { open, openPanel, derived } = useMemoryGraphContext();

  if (variant === 'none') return null;

  const armedAttr = derived.stationCount > 0 ? { 'data-mg-armed': '' } : {};
  const baseClass = className ? `mg-handle ${className}` : 'mg-handle';

  return (
    <button
      type="button"
      className={baseClass}
      style={style}
      data-mg-variant={variant}
      aria-label={`Open ${label}`}
      aria-expanded={open}
      onClick={openPanel}
      {...armedAttr}
    >
      <span className="mg-handle__label">{label}</span>
    </button>
  );
}
