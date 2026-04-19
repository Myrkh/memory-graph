import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useMemoryGraphContext, type HoverState } from './context.js';
import { formatDuration } from '../internal/format.js';
import { renderMarkdownLite } from '../internal/markdown-lite.js';

const TOOLTIP_OFFSET = 14;
const VIEWPORT_MARGIN = 8;

export interface TooltipProps {
  className?: string;
  style?: CSSProperties;
  pinnedLabel?: string;
}

/**
 * Hover card that follows the cursor. Two variants based on `hover.kind`:
 *
 * - `node` — station / passage info (extract + duration + visit count)
 * - `annotation` — the reader's note in italic serif (Innovation 03)
 */
export function Tooltip(props: TooltipProps) {
  const { className, style, pinnedLabel = 'PINNED' } = props;
  const { hover } = useMemoryGraphContext();
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !hover) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = hover.clientX + TOOLTIP_OFFSET;
    let y = hover.clientY + TOOLTIP_OFFSET;
    if (x + rect.width > vw - VIEWPORT_MARGIN) {
      x = hover.clientX - rect.width - TOOLTIP_OFFSET;
    }
    if (y + rect.height > vh - VIEWPORT_MARGIN) {
      y = hover.clientY - rect.height - TOOLTIP_OFFSET;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }, [hover]);

  const base = className ? `mg-tooltip ${className}` : 'mg-tooltip';
  const visibilityAttr = hover ? { 'data-mg-visible': '' } : {};

  if (!hover) {
    return (
      <div
        ref={ref}
        className={base}
        style={{ ...style, left: -9999, top: -9999 }}
        aria-hidden
      />
    );
  }

  return (
    <div ref={ref} className={base} style={style} role="tooltip" {...visibilityAttr}>
      {hover.kind === 'node' ? (
        <NodeTooltipBody hover={hover} pinnedLabel={pinnedLabel} />
      ) : (
        <AnnotationTooltipBody hover={hover} />
      )}
    </div>
  );
}

interface NodeBodyProps {
  hover: Extract<HoverState, { kind: 'node' }>;
  pinnedLabel: string;
}

function NodeTooltipBody({ hover, pinnedLabel }: NodeBodyProps) {
  const { item } = hover;
  const isPassage = item.type === 'passage';
  const typeTag = isPassage
    ? 'PASSAGE'
    : `STATION ${String(item.order + 1).padStart(2, '0')}`;
  const duration = formatDuration(item.totalMs);
  const metaValue = isPassage
    ? 'scrolled'
    : `${duration.value}${duration.unit}${duration.secondUnit ?? ''}`;
  const visitsLabel = !isPassage && item.visits > 1 ? ` · ${item.visits}×` : '';

  return (
    <>
      <div>
        <span className="mg-tooltip__num">{typeTag}</span>
      </div>
      <div className="mg-tooltip__extract">{item.extract}</div>
      <div className="mg-tooltip__meta">
        <span>
          {metaValue}
          {visitsLabel}
        </span>
        {item.pinned ? (
          <span style={{ color: 'var(--mg-accent)' }}>{pinnedLabel}</span>
        ) : null}
      </div>
    </>
  );
}

interface AnnotationBodyProps {
  hover: Extract<HoverState, { kind: 'annotation' }>;
}

function AnnotationTooltipBody({ hover }: AnnotationBodyProps) {
  const { annotation } = hover;
  const hasNote = annotation.note !== null && annotation.note.trim().length > 0;
  return (
    <>
      <div>
        <span className="mg-tooltip__num">ANNOTATION</span>
      </div>
      <div className="mg-tooltip__extract">{annotation.selection.text}</div>
      {hasNote ? (
        <div className="mg-tooltip__note">{renderMarkdownLite(annotation.note ?? '')}</div>
      ) : (
        <div className="mg-tooltip__meta">
          <span>selection only · no note</span>
        </div>
      )}
    </>
  );
}
