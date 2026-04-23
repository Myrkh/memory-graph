import type { CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';

export interface DeepestIndicatorProps {
  className?: string;
  style?: CSSProperties;
  /** Label shown to the left of the extract (default: "deepest"). */
  label?: string;
  /** Max words of the deepest extract before truncation with `…`.
   * Default 5 — keeps the row on a single line in narrow containers
   * (Chrome side panel). Pass a higher value in wide desktop panels
   * if you want more context. */
  maxExtractWords?: number;
}

/** Word-based trim · preserves whitespace collapsing, appends `…`
 *  only when the source was actually trimmed. Undefined / empty
 *  input returns empty string. */
function truncateWords(source: string | undefined, max: number): string {
  if (!source) return '';
  const words = source.trim().split(/\s+/);
  if (words.length <= max) return words.join(' ');
  return `${words.slice(0, max).join(' ')}…`;
}

/**
 * Shows the station with the highest cumulative dwell. Hidden via CSS when
 * no stations exist. Extract is word-trimmed to keep the row single-line
 * in narrow layouts — no typographic wrap, no vertical jitter.
 */
export function DeepestIndicator(props: DeepestIndicatorProps) {
  const { className, style, label = 'deepest', maxExtractWords = 5 } = props;
  const { derived } = useMemoryGraphContext();
  const deepest = derived.deepest;

  const base = className ? `mg-deepest ${className}` : 'mg-deepest';
  const visibilityAttr = deepest ? { 'data-mg-visible': '' } : {};

  if (!deepest) {
    return <div className={base} style={style} {...visibilityAttr} aria-hidden />;
  }

  const seconds = Math.round(deepest.node.totalMs / 1000);
  const visitLabel = deepest.node.visits === 1 ? 'visit' : 'visits';
  const extract = truncateWords(deepest.node.extract, maxExtractWords);

  return (
    <div
      className={base}
      style={style}
      {...visibilityAttr}
      title={deepest.node.extract}
    >
      <span className="mg-deepest__k">{label}</span>
      <span className="mg-deepest__extract">{extract}</span>
      <span
        style={{
          color: 'var(--mg-fg-subtle)',
          fontFamily: 'var(--mg-font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          marginLeft: 6,
        }}
      >
        · {seconds}s · {deepest.node.visits} {visitLabel}
      </span>
    </div>
  );
}
