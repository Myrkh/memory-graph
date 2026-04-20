import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useMemoryGraphContext } from './context.js';
import { useTextSelection } from '../hooks/useTextSelection.js';
import type { ResolvedSelection } from '../internal/selection-offsets.js';
import { detectScope } from '../internal/annotation-dom.js';
import { NoteEditor } from './NoteEditor.js';

export interface SelectionToolbarProps {
  className?: string;
  style?: CSSProperties;
  /**
   * Reject selections shorter than this many characters. Default 4 (spec §03).
   */
  minChars?: number;
  /**
   * Message shown when the user clicks "Link" with no annotations to link to.
   */
  linkingEmptyMessage?: string;
}

type Mode = 'idle' | 'editing';

const VIEWPORT_MARGIN = 8;
const TOOLBAR_GAP = 8;

/**
 * Micro-toolbar that appears below a qualifying text selection. Renders
 * Note + Pin + Link actions (Innovation 03). Link is a placeholder until
 * Innovation 04 ships — clicking it surfaces an informative toast rather
 * than silently noop-ing.
 */
export function SelectionToolbar(props: SelectionToolbarProps) {
  const {
    className,
    style,
    minChars = 4,
    linkingEmptyMessage = 'Create an annotation first — then you can link to it.',
  } = props;
  const {
    zoneElement,
    actions,
    showToast,
    state,
    linkingMode,
    setLinkingMode,
  } = useMemoryGraphContext();

  const [selection, setSelection] = useState<ResolvedSelection | null>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [frozen, setFrozen] = useState<ResolvedSelection | null>(null);

  useTextSelection(zoneElement, {
    minChars,
    onSelect: (sel) => {
      setSelection((prev) => {
        if (mode === 'editing') return prev;
        return sel;
      });
    },
  });

  const active = mode === 'editing' ? frozen : selection;

  const preventSelectionLoss = useCallback((e: ReactMouseEvent) => {
    const target = e.target;
    if (target instanceof Element && target.closest('input, textarea')) return;
    e.preventDefault();
  }, []);

  const handleNoteClick = useCallback(() => {
    if (!selection) return;
    setFrozen(selection);
    setMode('editing');
  }, [selection]);

  const handlePinClick = useCallback(() => {
    if (!selection) return;
    const text = selection.paraElement.textContent ?? '';
    actions.togglePin(selection.paraId, text);
    showToast('Paragraph pinned');
    setSelection(null);
    clearLiveSelection();
  }, [actions, selection, showToast]);

  const handleLinkClick = useCallback(() => {
    if (!selection) return;
    if (state.annotations.size === 0) {
      showToast(linkingEmptyMessage);
      return;
    }
    setLinkingMode({ pendingSelection: selection });
    setSelection(null);
    clearLiveSelection();
  }, [linkingEmptyMessage, selection, setLinkingMode, showToast, state.annotations.size]);

  const handleSave = useCallback(
    (note: string | null) => {
      if (!frozen) return;
      actions.addAnnotation({
        paraId: frozen.paraId,
        selection: {
          text: frozen.text,
          offsetStart: frozen.offsetStart,
          offsetEnd: frozen.offsetEnd,
        },
        note,
        scope: detectScope(frozen.paraElement, frozen.offsetStart, frozen.offsetEnd),
      });
      setMode('idle');
      setFrozen(null);
      setSelection(null);
      clearLiveSelection();
    },
    [actions, frozen],
  );

  const handleCancel = useCallback(() => {
    setMode('idle');
    setFrozen(null);
  }, []);

  if (!active) return null;
  // Hide the idle toolbar while the user is picking a link target.
  if (linkingMode && mode !== 'editing') return null;

  return (
    <Positioner rect={active.rect}>
      <div
        className={className ? `mg-selection-toolbar ${className}` : 'mg-selection-toolbar'}
        style={style}
        role="toolbar"
        aria-label="Text selection actions"
        onMouseDown={preventSelectionLoss}
      >
        {mode === 'idle' ? (
          <div className="mg-selection-toolbar__actions">
            <ToolbarButton glyph="◇" label="Note" onClick={handleNoteClick} />
            <ToolbarButton glyph="⬤" label="Pin" onClick={handlePinClick} />
            {state.annotations.size > 0 ? (
              <ToolbarButton glyph="→" label="Link" onClick={handleLinkClick} />
            ) : null}
          </div>
        ) : (
          <NoteEditor onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>
    </Positioner>
  );
}

/* ---------------------------------------------------------------------- */

interface ToolbarButtonProps {
  glyph: string;
  label: string;
  onClick: () => void;
}

function ToolbarButton({ glyph, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="mg-selection-toolbar__btn"
      onClick={onClick}
      aria-label={label}
    >
      <span className="mg-selection-toolbar__glyph" aria-hidden>
        {glyph}
      </span>
      <span className="mg-selection-toolbar__label">{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------------- */

interface PositionerProps {
  rect: DOMRect;
  children: React.ReactNode;
}

/**
 * Fixed-position wrapper that anchors content below the selection rect,
 * flipping above when it would overflow the bottom of the viewport.
 */
function Positioner({ rect, children }: PositionerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = (): void => {
      const { width: w, height: h } = el.getBoundingClientRect();
      if (w === 0 || h === 0) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = rect.left + rect.width / 2 - w / 2;
      left = Math.max(VIEWPORT_MARGIN, Math.min(vw - w - VIEWPORT_MARGIN, left));

      const below = rect.bottom + TOOLBAR_GAP;
      const above = rect.top - TOOLBAR_GAP - h;
      const flip = below + h > vh - VIEWPORT_MARGIN;
      const top = flip ? Math.max(VIEWPORT_MARGIN, above) : below;

      setPos((prev) => {
        if (prev && prev.top === top && prev.left === left && prev.flipped === flip) {
          return prev;
        }
        return { top, left, flipped: flip };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.setAttribute('data-mg-visible', '');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const inlineStyle: CSSProperties = pos
    ? { top: pos.top, left: pos.left }
    : { top: -9999, left: -9999 };

  return (
    <div
      ref={ref}
      className="mg-selection-toolbar-anchor"
      style={inlineStyle}
      data-mg-flipped={pos?.flipped ? '' : undefined}
    >
      {children}
    </div>
  );
}

function clearLiveSelection(): void {
  if (typeof window === 'undefined') return;
  window.getSelection()?.removeAllRanges();
}
