import { useMemo, type CSSProperties } from 'react';
import type { Annotation, ParagraphId } from '../types.js';
import { layoutTrack, type TrackLayout } from '../internal/track-layout.js';
import { useMemoryGraphContext } from './context.js';

const ROW_EXTRACT_MAX = 72;
const ROW_NOTE_MAX = 58;

export interface AnnotationsTrackProps {
  className?: string;
  style?: CSSProperties;
  /** Title shown at the top of the column (default "TRACK"). */
  kicker?: string;
}

/**
 * Secondary column anchored to the right of the Panel, rendering a vertical
 * git-graph-style list of every annotation plus the arcs between linked
 * ones. Same visual grammar as the main graph (coral diamonds + dashed
 * coral arcs 3/2) so the Track reads as *a vertical variant*, not a new
 * widget. Opt-in: consumer mounts it as a sibling of Panel.
 *
 * Always mounted (width transitions 0 → open). Hidden via CSS when the
 * panel is closed OR when trackOpen is false.
 */
export function AnnotationsTrack(props: AnnotationsTrackProps) {
  const { className, style, kicker = 'TRACK' } = props;
  const {
    state,
    trackOpen,
    open,
    closePanel,
    zoneElement,
    triggerFlash,
    setHoveredAnnotation,
    setHoveredNode,
  } = useMemoryGraphContext();

  const annotations = useMemo<Annotation[]>(() => {
    const list = [...state.annotations.values()];
    list.sort((a, b) => a.createdAt - b.createdAt);
    return list;
  }, [state.annotations]);

  const layout = useMemo<TrackLayout>(() => layoutTrack(annotations), [annotations]);

  const visible = open && trackOpen;
  const base = className ? `mg-annotations-track ${className}` : 'mg-annotations-track';
  const dataAttrs = visible ? { 'data-mg-visible': '' } : {};

  const onJump = (paraId: ParagraphId): void => {
    closePanel();
    window.setTimeout(() => {
      const root = zoneElement ?? document.body;
      const el = root.querySelector<HTMLElement>(
        `[data-mg-id="${CSS.escape(paraId)}"]`,
      );
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => triggerFlash(paraId), 200);
    }, 200);
  };

  return (
    <aside
      className={base}
      style={style}
      aria-label="Annotations track"
      aria-hidden={!visible}
      {...dataAttrs}
    >
      <header className="mg-annotations-track__head">
        <span className="mg-annotations-track__kicker">{kicker}</span>
        <span className="mg-annotations-track__count">
          {annotations.length} {annotations.length === 1 ? 'note' : 'notes'}
        </span>
      </header>

      {annotations.length === 0 ? (
        <p className="mg-annotations-track__empty">
          No annotations yet. Select text in a paragraph to begin.
        </p>
      ) : (
        <div className="mg-annotations-track__body">
          <svg
            className="mg-annotations-track__graph"
            viewBox={`0 0 ${layout.laneX * 2 + 8} ${layout.totalHeight}`}
            height={layout.totalHeight}
            width={layout.laneX * 2 + 8}
            aria-hidden
          >
            <line
              className="mg-annotations-track__lane"
              x1={layout.laneX}
              y1={0}
              x2={layout.laneX}
              y2={layout.totalHeight}
            />
            {layout.arcs.map((arc) => (
              <path
                key={`${arc.fromId}→${arc.toId}`}
                className="mg-annotations-track__arc"
                d={arc.d}
              />
            ))}
            {layout.rows.map((row) => (
              <g
                key={row.annotationId}
                className="mg-annotations-track__node"
                transform={`translate(${layout.laneX} ${row.y}) rotate(45)`}
              >
                <rect x={-4} y={-4} width={8} height={8} />
              </g>
            ))}
          </svg>

          <ul className="mg-annotations-track__list" style={{ minHeight: layout.totalHeight }}>
            {annotations.map((annotation, i) => (
              <li
                key={annotation.id}
                className="mg-annotations-track__row"
                style={
                  {
                    '--mg-row-delay': `${i * 30}ms`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="mg-annotations-track__row-btn"
                  onClick={() => onJump(annotation.paraId)}
                  onMouseEnter={() => {
                    setHoveredAnnotation(annotation.id);
                    setHoveredNode(annotation.paraId);
                  }}
                  onMouseLeave={() => {
                    setHoveredAnnotation(null);
                    setHoveredNode(null);
                  }}
                  data-mg-annotation-id={annotation.id}
                >
                  <div className="mg-annotations-track__meta">
                    <span className="mg-annotations-track__seq">
                      ANN-{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mg-annotations-track__meta-sep" aria-hidden>·</span>
                    <time
                      className="mg-annotations-track__time"
                      dateTime={new Date(annotation.createdAt).toISOString()}
                    >
                      {formatTimestamp(annotation.createdAt)}
                    </time>
                  </div>
                  <span className="mg-annotations-track__extract">
                    {truncate(annotation.selection.text, ROW_EXTRACT_MAX)}
                  </span>
                  {annotation.note ? (
                    <span className="mg-annotations-track__note">
                      {truncate(annotation.note, ROW_NOTE_MAX)}
                    </span>
                  ) : null}
                  {annotation.links.length > 0 ? (
                    <span className="mg-annotations-track__link-count">
                      {annotation.links.length} link{annotation.links.length === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

/**
 * Local-time `HH:MM` — honest absolute time, stable across reloads. Respects
 * the user's locale via toLocaleTimeString (24h vs 12h picked automatically).
 */
function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
