import type { CSSProperties, ReactNode } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface HeadProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Panel header. Consumer composes Title + CloseButton + Stats inside.
 */
export function Head(props: HeadProps) {
  const { className, style, children } = props;
  const base = className ? `mg-panel__head ${className}` : 'mg-panel__head';
  return (
    <header className={base} style={style}>
      {children}
    </header>
  );
}

export interface TitleRowProps {
  className?: string;
  children: ReactNode;
}

/** Flex row holding the title on the left and the close button on the right. */
export function TitleRow(props: TitleRowProps) {
  const { className, children } = props;
  const base = className ? `mg-panel__title-row ${className}` : 'mg-panel__title-row';
  return <div className={base}>{children}</div>;
}

export interface TitleProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Panel title. Default content is "Memory <em>Graph</em>" — pass `children` to
 * override while keeping the styled wrapper.
 */
export function Title(props: TitleProps) {
  const { className, children } = props;
  const base = className ? `mg-panel__title ${className}` : 'mg-panel__title';
  return (
    <h2 className={base}>
      {children ?? (
        <>
          Memory <em>Graph</em>
        </>
      )}
    </h2>
  );
}

export interface CloseButtonProps {
  className?: string;
  label?: string;
}

/** Round close button (×) wired to the root's closePanel. */
export function CloseButton(props: CloseButtonProps) {
  const { className, label = 'Close panel' } = props;
  const { closePanel } = useMemoryGraphContext();
  const base = className ? `mg-panel__close ${className}` : 'mg-panel__close';
  return (
    <button type="button" className={base} aria-label={label} onClick={closePanel}>
      ×
    </button>
  );
}
