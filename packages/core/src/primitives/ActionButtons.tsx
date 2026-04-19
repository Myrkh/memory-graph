import type { MouseEvent, ReactNode } from 'react';
import { useMemoryGraphContext } from './context.js';
import type { ExportMeta } from '../hooks/usePersistence.js';

export interface ClearButtonProps {
  className?: string;
  children?: ReactNode;
  /**
   * Called before clearing. Return `false` (or a falsy Promise value) to
   * abort. Useful for a custom confirm dialog; defaults to no confirmation.
   */
  onBeforeClear?: () => boolean | Promise<boolean>;
}

/** Wipes the graph (nodes, edges, passages, intensity) and the persisted snapshot. */
export function ClearButton(props: ClearButtonProps) {
  const { className, children = 'Clear', onBeforeClear } = props;
  const { actions, clearPersisted } = useMemoryGraphContext();
  const base = className ? `mg-foot__btn ${className}` : 'mg-foot__btn';

  const handle = async (): Promise<void> => {
    if (onBeforeClear) {
      const ok = await onBeforeClear();
      if (!ok) return;
    }
    actions.clear();
    clearPersisted();
  };

  return (
    <button type="button" className={base} onClick={handle}>
      {children}
    </button>
  );
}

export interface ExportButtonProps {
  className?: string;
  children?: ReactNode;
  /** Filename for the downloaded JSON (default: `memory-graph.json`). */
  filename?: string;
  /** Metadata merged into the exported payload (url / capturedAt). */
  meta?: ExportMeta;
  /**
   * Override the default download-blob behavior. Receives the JSON string
   * and can send it elsewhere (e.g. a fetch, a clipboard copy).
   */
  onExport?: (json: string) => void;
}

/** Serializes the graph and triggers a JSON download (or custom onExport). */
export function ExportButton(props: ExportButtonProps) {
  const {
    className,
    children = 'Export',
    filename = 'memory-graph.json',
    meta,
    onExport,
  } = props;
  const { exportJson } = useMemoryGraphContext();
  const base = className ? `mg-foot__btn ${className}` : 'mg-foot__btn';

  const handle = (): void => {
    const json = exportJson(meta);
    if (onExport) {
      onExport(json);
      return;
    }
    if (typeof document === 'undefined') return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" className={base} onClick={handle}>
      {children}
    </button>
  );
}

export interface PassagesToggleProps {
  className?: string;
  /**
   * Label. If omitted, shows `"Passages"` — with the current count in
   * parentheses when at least one passage exists (e.g. `"Passages (3)"`).
   */
  children?: ReactNode;
  /**
   * Message shown in the pin toast if the user tries to reveal passages
   * when none have been recorded yet. Pass `null` to stay silent.
   */
  emptyHint?: string | null;
}

/**
 * Toggle that reveals the "passages" (below-dwell paragraphs) on the graph.
 *
 * When clicked while no passage has been recorded yet, triggers a friendly
 * toast instead of silently toggling — prevents the "it does nothing"
 * confusion when all visible paragraphs happen to be stations.
 */
export function PassagesToggle(props: PassagesToggleProps) {
  const {
    className,
    children,
    emptyHint = 'No passages yet — scroll past a paragraph without pausing to log one.',
  } = props;
  const { state, showPassages, actions, showToast } = useMemoryGraphContext();
  const count = state.passages.size;
  const base = className ? `mg-foot__btn ${className}` : 'mg-foot__btn';
  const activeAttr = showPassages ? { 'data-mg-active': '' } : {};

  const handle = (_e: MouseEvent<HTMLButtonElement>): void => {
    if (count === 0 && !showPassages && emptyHint) {
      showToast(emptyHint);
      return;
    }
    actions.toggleShowPassages();
  };

  const label = children ?? (count > 0 ? `Passages (${count})` : 'Passages');

  return (
    <button
      type="button"
      className={base}
      aria-pressed={showPassages}
      onClick={handle}
      {...activeAttr}
    >
      {label}
    </button>
  );
}
