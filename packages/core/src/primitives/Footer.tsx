import type { CSSProperties, ReactNode } from 'react';

export interface FooterProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Container for the panel action buttons. Use Footer.Group to cluster buttons
 * on the left or right of the bar.
 */
export function Footer(props: FooterProps) {
  const { className, style, children } = props;
  const base = className ? `mg-foot ${className}` : 'mg-foot';
  return (
    <footer className={base} style={style}>
      {children}
    </footer>
  );
}

export interface FooterGroupProps {
  className?: string;
  children: ReactNode;
}

/** Horizontal cluster of buttons inside the footer. */
export function FooterGroup(props: FooterGroupProps) {
  const { className, children } = props;
  const base = className ? `mg-foot__group ${className}` : 'mg-foot__group';
  return <div className={base}>{children}</div>;
}
