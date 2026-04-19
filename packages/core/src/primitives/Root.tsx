import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  DEFAULT_CONFIG,
  type AnnotationId,
  type MemoryGraphConfig,
  type ParagraphId,
} from '../types.js';
import { useMemoryGraphState } from '../hooks/useMemoryGraphState.js';
import { usePersistence } from '../hooks/usePersistence.js';
import { useAttentionTracker } from '../hooks/useAttentionTracker.js';
import {
  MemoryGraphContext,
  type HoverState,
  type LinkingMode,
  type MemoryGraphContextValue,
} from './context.js';

export interface RootProps {
  /**
   * localStorage key under which the graph is persisted.
   * Usually derived from the URL or essay identifier.
   */
  storageKey: string;
  /** Partial overrides merged into {@link DEFAULT_CONFIG}. */
  config?: Partial<MemoryGraphConfig>;
  /** Initial panel open state (default: false). */
  defaultOpen?: boolean;
  /** Controlled panel open state. Omit for uncontrolled. */
  open?: boolean;
  /** Called whenever open state changes. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const FLASH_MS = 1800;
const TOAST_MS = 1600;

/**
 * The root of a memory-graph composition. Owns the runtime state, wires the
 * three hooks, and provides context to every descendant primitive.
 *
 * @example
 * <MemoryGraph.Root storageKey="mg:my-essay">
 *   <MemoryGraph.Zone>{paragraphs}</MemoryGraph.Zone>
 *   <MemoryGraph.Handle />
 *   <MemoryGraph.Panel>...</MemoryGraph.Panel>
 *   <MemoryGraph.Backdrop />
 * </MemoryGraph.Root>
 */
export function Root(props: RootProps) {
  const {
    storageKey,
    config: configOverrides,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    className,
    style,
    children,
  } = props;

  const config = useMemo<MemoryGraphConfig>(
    () => ({ ...DEFAULT_CONFIG, ...configOverrides, STORAGE_KEY: storageKey }),
    [configOverrides, storageKey],
  );

  const zoneRef = useRef<HTMLElement | null>(null);

  const { state, previousStationId, showPassages, actions, derived } =
    useMemoryGraphState(config);

  const { exportJson, clearPersisted } = usePersistence(state, storageKey, actions.restore);

  const { currentParaId } = useAttentionTracker(zoneRef, {
    config,
    onCommit: actions.commit,
  });

  /* -- Panel open (controlled + uncontrolled) --------------------------- */

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const openPanel = useCallback(() => setOpen(true), [setOpen]);
  const closePanel = useCallback(() => setOpen(false), [setOpen]);
  const togglePanel = useCallback(() => setOpen(!open), [open, setOpen]);

  /* -- Flash (scroll-to-paragraph animation) ---------------------------- */

  const [flashParaId, setFlashParaId] = useState<ParagraphId | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = useCallback((paraId: ParagraphId) => {
    setFlashParaId(paraId);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashParaId(null), FLASH_MS);
  }, []);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    [],
  );

  /* -- Toast ------------------------------------------------------------ */

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  /* -- Hover (for Tooltip) --------------------------------------------- */

  const [hover, setHover] = useState<HoverState | null>(null);

  /* -- Linking mode (Innovation 04) ------------------------------------ */

  const [linkingMode, setLinkingMode] = useState<LinkingMode | null>(null);

  /* -- Hovered annotation (Innovation 04 · link reveal) --------------- */

  const [hoveredAnnotationId, setHoveredAnnotation] =
    useState<AnnotationId | null>(null);

  /* -- Annotations Track (side column) -------------------------------- */

  const [trackOpen, setTrackOpen] = useState(false);

  useEffect(() => {
    if (!open) setTrackOpen(false);
  }, [open]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (linkingMode) body.setAttribute('data-mg-linking', '');
    else body.removeAttribute('data-mg-linking');
    return () => body.removeAttribute('data-mg-linking');
  }, [linkingMode]);

  useEffect(() => {
    if (!linkingMode) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLinkingMode(null);
      }
    };
    const onClickOutside = (e: MouseEvent): void => {
      if (!(e.target instanceof Element)) return;
      // Keep mode active if the click lands on an annotation or a satellite.
      if (e.target.closest('[data-mg-annotation-id]')) return;
      setLinkingMode(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [linkingMode]);

  /* -- Bidirectional hover (paragraph ↔ node) -------------------------- */

  const [hoveredNodeId, setHoveredNodeState] = useState<ParagraphId | null>(null);

  const setHoveredNode = useCallback(
    (id: ParagraphId | null) => {
      if (id !== null && !open) return;
      setHoveredNodeState(id);
    },
    [open],
  );

  useEffect(() => {
    if (!open) setHoveredNodeState(null);
  }, [open]);

  /* -- Context memoization --------------------------------------------- */

  const value = useMemo<MemoryGraphContextValue>(
    () => ({
      config,
      state,
      previousStationId,
      showPassages,
      derived,
      actions,
      currentParaId,
      zoneRef,
      exportJson,
      clearPersisted,
      open,
      openPanel,
      closePanel,
      togglePanel,
      flashParaId,
      triggerFlash,
      toastMessage,
      showToast,
      hover,
      setHover,
      hoveredNodeId,
      setHoveredNode,
      linkingMode,
      setLinkingMode,
      hoveredAnnotationId,
      setHoveredAnnotation,
      trackOpen,
      setTrackOpen,
    }),
    [
      config,
      state,
      previousStationId,
      showPassages,
      derived,
      actions,
      currentParaId,
      exportJson,
      clearPersisted,
      open,
      openPanel,
      closePanel,
      togglePanel,
      flashParaId,
      triggerFlash,
      toastMessage,
      showToast,
      hover,
      hoveredNodeId,
      setHoveredNode,
      linkingMode,
      hoveredAnnotationId,
      trackOpen,
    ],
  );

  const rootDataProps = {
    ...(open ? { 'data-mg-open': '' } : {}),
    ...(trackOpen ? { 'data-mg-track-open': '' } : {}),
  };

  return (
    <MemoryGraphContext.Provider value={value}>
      <div className={className} style={style} data-mg-root {...rootDataProps}>
        {children}
      </div>
    </MemoryGraphContext.Provider>
  );
}
