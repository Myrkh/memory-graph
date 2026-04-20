import {
  useCallback,
  useEffect,
  useMemo,
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
import { useLinkingModeEffects } from '../hooks/useLinkingModeEffects.js';
import { useZoneAnnotations } from '../hooks/useZoneAnnotations.js';
import { useTimedValue } from '../hooks/useTimedValue.js';
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
  /**
   * Abstract "route" bucket stamped on every tracked node at commit time.
   * Whatever the consumer wants — URL path, tab id, document id, mode
   * name. Agnostic of any routing library. When two or more unique
   * routes accumulate in state, `<Graph>` switches to a 2D column layout
   * (one column per route). Omit for a single-page / single-bucket graph.
   */
  route?: string;
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
    route,
    className,
    style,
    children,
  } = props;

  const config = useMemo<MemoryGraphConfig>(
    () => ({ ...DEFAULT_CONFIG, ...configOverrides, STORAGE_KEY: storageKey }),
    [configOverrides, storageKey],
  );

  /**
   * Live `<Zone>` element (state, not ref) — lets observer hooks re-run when
   * the zone mounts/unmounts under a persistent Root (Provider-at-root).
   * `null` when no `<Zone>` is mounted; consumers fall back to `document.body`.
   */
  const [zoneElement, setZoneElement] = useState<HTMLElement | null>(null);

  const { state, previousStationId, showPassages, actions, derived } =
    useMemoryGraphState(config);

  const { exportJson, clearPersisted } = usePersistence(state, storageKey, actions.restore);

  const { currentParaId } = useAttentionTracker(zoneElement, {
    config,
    onCommit: actions.commit,
    ...(route !== undefined ? { route } : {}),
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

  /* -- Flash (scroll-to-paragraph animation) + toast -------------------- */

  const [flashParaId, triggerFlash] = useTimedValue<ParagraphId>(FLASH_MS);
  const [toastMessage, showToast] = useTimedValue<string>(TOAST_MS);

  /* -- Hover (for Tooltip) --------------------------------------------- */

  const [hover, setHover] = useState<HoverState | null>(null);

  /* -- Linking mode (Innovation 04) ------------------------------------ */

  const [linkingMode, setLinkingMode] = useState<LinkingMode | null>(null);
  useLinkingModeEffects(linkingMode, setLinkingMode);

  /* -- Hovered annotation (Innovation 04 · link reveal) --------------- */

  const [hoveredAnnotationId, setHoveredAnnotation] =
    useState<AnnotationId | null>(null);

  /* -- Annotations Track (side column) -------------------------------- */

  const [trackOpen, setTrackOpen] = useState(false);

  useEffect(() => {
    if (!open) setTrackOpen(false);
  }, [open]);

  /* -- Annotation range-flash (§Innovation 03) ------------------------ */

  const [flashAnnotationId, triggerAnnotationFlash] =
    useTimedValue<AnnotationId>(FLASH_MS);

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

  /* -- Annotation rendering · app-shell level so `[data-mg-id]`
   * elements OUTSIDE any `<Zone>` (multi-page sites, sidebar content,
   * anything) still get the coral marks + block treatment. Falls back
   * to `document.body` when `zoneElement` is null. */
  useZoneAnnotations(zoneElement, {
    annotations: state.annotations,
    flashAnnotationId,
    hoveredAnnotationId,
  });

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
      route,
      zoneElement,
      setZoneElement,
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
      flashAnnotationId,
      triggerAnnotationFlash,
    }),
    [
      config,
      state,
      previousStationId,
      showPassages,
      derived,
      actions,
      currentParaId,
      route,
      zoneElement,
      setZoneElement,
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
      flashAnnotationId,
      triggerAnnotationFlash,
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
