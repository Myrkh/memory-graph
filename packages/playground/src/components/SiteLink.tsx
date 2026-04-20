import type { ReactNode } from 'react';
import {
  handleSiteLinkClick,
  pathFromPage,
  type Page,
} from '../utils/navigation.js';

export interface SiteLinkProps {
  to: Page;
  children: ReactNode;
  className?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-label'?: string;
  'data-mg-id'?: string;
}

/**
 * Internal navigation link — wraps an `<a>` with a canonical `href`
 * (`/`, `/demo`, `/docs`, `/philosophy`) and intercepts the click to run
 * the directional view transition via `navigate()`. Canonical paths
 * (not `#` hashes) mean each route is a separate crawlable URL, so
 * Google can index all four pages as distinct documents.
 *
 * Respects modifier keys so Cmd/Ctrl-click still opens in a new tab,
 * which is what users expect from a real link.
 */
export function SiteLink({ to, children, className, ...rest }: SiteLinkProps) {
  return (
    <a
      href={pathFromPage(to)}
      className={className}
      onClick={(e) => handleSiteLinkClick(e, to)}
      {...rest}
    >
      {children}
    </a>
  );
}
