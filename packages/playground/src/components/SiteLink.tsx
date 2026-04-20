import type { ReactNode } from 'react';
import { handleSiteLinkClick, type Page } from '../utils/navigation.js';

export interface SiteLinkProps {
  to: Page;
  children: ReactNode;
  className?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-label'?: string;
}

/**
 * Internal navigation link — wraps an `<a>` and intercepts the click to
 * trigger a directional view transition (`navigate()` in
 * `utils/navigation.ts`). Respects modifier keys so Cmd/Ctrl-click still
 * opens in a new tab, which is what a user expects from a real link.
 */
export function SiteLink({ to, children, className, ...rest }: SiteLinkProps) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => handleSiteLinkClick(e, to)}
      {...rest}
    >
      {children}
    </a>
  );
}
