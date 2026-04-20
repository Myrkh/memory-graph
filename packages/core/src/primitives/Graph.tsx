import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { Annotation, AnnotationId, GraphItem, ParagraphId } from '../types.js';
import {
  buildItems,
  layoutGraph,
  stationRadius,
  type GraphLayout,
} from '../internal/graph-layout.js';
import { AxisMarks, Edges, Nodes } from '../internal/graph-svg.js';
import { AnnotationSatellites } from '../internal/annotation-satellites.js';
import { AnnotationLinks } from '../internal/annotation-links.js';
import { computeSatellitePositions } from '../internal/annotation-layout.js';
import { useMemoryGraphContext } from './context.js';

/**
 * Strict ego set for chain-highlight. Given a hovered node id:
 * - `nodes` = { hoveredId, ...endpoints of edges TOUCHING hoveredId }
 * - `annotations` = { annotations of hoveredId } ∪
 *                   { annotations linked from hoveredId's annotations }
 *
 * An edge is considered "in-chain" iff one of its endpoints IS hoveredId —
 * not simply "both endpoints happen to be in the set". This answers
 * "where does THIS node go", not "the neighborhood around it".
 */
export interface ChainSet {
  hoveredId: ParagraphId;
  nodes: Set<ParagraphId>;
  annotations: Set<AnnotationId>;
}

export interface GraphProps {
  className?: string;
  style?: CSSProperties;
  /**
   * Delay between `closePanel()` and `scrollIntoView` on node click. Gives
   * the panel time to slide out. Default 200ms.
   */
  jumpDelayMs?: number;
  /** Called in addition to the default jump behavior with the clicked id. */
  onNodeClick?: (paraId: ParagraphId) => void;
}

/**
 * SVG rendering of the reading graph: stations + optional passages,
 * forward/return edges, and minute axis. Clicking a node scrolls the
 * corresponding paragraph into view and triggers a flash.
 */
export function Graph(props: GraphProps) {
  const { className, style, jumpDelayMs = 200, onNodeClick } = props;
  const {
    config,
    state,
    showPassages,
    currentParaId,
    zoneRef,
    closePanel,
    triggerFlash,
    triggerAnnotationFlash,
    setHover,
    hoveredNodeId,
    setHoveredNode,
    linkingMode,
    setLinkingMode,
    actions,
  } = useMemoryGraphContext();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [svgWidth, setSvgWidth] = useState(400);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = (): void => {
      const width = el.clientWidth;
      if (width > 0) setSvgWidth(width);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const items = useMemo<GraphItem[]>(
    () => buildItems(state.nodes, state.passages, showPassages),
    [state.nodes, state.passages, showPassages],
  );

  const layout = useMemo<GraphLayout | null>(
    () => layoutGraph(items, svgWidth, config),
    [items, svgWidth, config],
  );

  const maxMs = useMemo(() => {
    let max = 1;
    for (const node of state.nodes.values()) {
      if (node.totalMs > max) max = node.totalMs;
    }
    return max;
  }, [state.nodes]);

  const jumpToParagraph = useCallback(
    (paraId: ParagraphId) => {
      onNodeClick?.(paraId);
      closePanel();
      window.setTimeout(() => {
        const el = zoneRef.current?.querySelector<HTMLElement>(
          `[data-mg-id="${CSS.escape(paraId)}"]`,
        );
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => triggerFlash(paraId), jumpDelayMs);
      }, jumpDelayMs);
    },
    [closePanel, jumpDelayMs, onNodeClick, triggerFlash, zoneRef],
  );

  const nodeRadiusFor = useCallback(
    (paraId: ParagraphId): number => {
      const node = state.nodes.get(paraId);
      if (!node) return config.PASSAGE_R;
      return stationRadius(node.totalMs, maxMs, config.NODE_R_MIN, config.NODE_R_MAX);
    },
    [config.NODE_R_MAX, config.NODE_R_MIN, config.PASSAGE_R, maxMs, state.nodes],
  );

  const handleSatelliteClick = useCallback(
    (annotation: Annotation) => {
      if (linkingMode) {
        actions.addAnnotationWithLink(
          {
            paraId: linkingMode.pendingSelection.paraId,
            selection: {
              text: linkingMode.pendingSelection.text,
              offsetStart: linkingMode.pendingSelection.offsetStart,
              offsetEnd: linkingMode.pendingSelection.offsetEnd,
            },
          },
          annotation.id,
        );
        setLinkingMode(null);
        return;
      }
      // Jump to paragraph + flash the annotated SPAN (not the whole paragraph).
      onNodeClick?.(annotation.paraId);
      closePanel();
      window.setTimeout(() => {
        const el = zoneRef.current?.querySelector<HTMLElement>(
          `[data-mg-annotation-id="${CSS.escape(annotation.id)}"]`,
        );
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => triggerAnnotationFlash(annotation.id), jumpDelayMs);
      }, jumpDelayMs);
    },
    [
      actions,
      closePanel,
      jumpDelayMs,
      linkingMode,
      onNodeClick,
      setLinkingMode,
      triggerAnnotationFlash,
      zoneRef,
    ],
  );

  const satellitePositions = useMemo(
    () => (layout ? computeSatellitePositions(layout.positions, state.annotations, nodeRadiusFor) : new Map()),
    [layout, nodeRadiusFor, state.annotations],
  );

  const chain = useMemo<ChainSet | null>(() => {
    if (!hoveredNodeId || !state.nodes.has(hoveredNodeId)) return null;

    // Nodes reached directly by an edge touching hoveredId.
    const nodes = new Set<ParagraphId>([hoveredNodeId]);
    for (const e of state.edges) {
      if (e.from === hoveredNodeId) nodes.add(e.to);
      if (e.to === hoveredNodeId) nodes.add(e.from);
    }

    // Annotations owned by hoveredId + annotations those link to
    // (semantic paths OUT of this node, not incidental neighborhood notes).
    const hoveredAnnotations = new Set<AnnotationId>();
    for (const a of state.annotations.values()) {
      if (a.paraId === hoveredNodeId) hoveredAnnotations.add(a.id);
    }
    const annotations = new Set<AnnotationId>(hoveredAnnotations);
    for (const annId of hoveredAnnotations) {
      const ann = state.annotations.get(annId);
      if (!ann) continue;
      for (const linkedId of ann.links) {
        if (state.annotations.has(linkedId)) annotations.add(linkedId);
      }
    }

    return { hoveredId: hoveredNodeId, nodes, annotations };
  }, [hoveredNodeId, state.edges, state.annotations, state.nodes]);

  const base = className ? `mg-graph-wrap ${className}` : 'mg-graph-wrap';

  return (
    <div className={base} style={style} ref={wrapRef}>
      {layout ? (
        <svg
          className="mg-svg"
          viewBox={`0 0 ${svgWidth} ${layout.totalHeight}`}
          height={layout.totalHeight}
          style={{ width: svgWidth }}
          role="img"
          aria-label="Reading memory graph"
          data-mg-chain-active={chain ? '' : undefined}
        >
          <AxisMarks layout={layout} svgWidth={svgWidth} paddingTop={config.GRAPH_PADDING_TOP} />
          <Edges
            edges={state.edges}
            layout={layout}
            returnBend={config.RETURN_BEND}
            chain={chain}
          />
          <Nodes
            layout={layout}
            maxMs={maxMs}
            currentParaId={currentParaId}
            hoveredNodeId={hoveredNodeId}
            chain={chain}
            passageR={config.PASSAGE_R}
            minR={config.NODE_R_MIN}
            maxR={config.NODE_R_MAX}
            onClick={jumpToParagraph}
            onHover={setHover}
            onHoverNode={setHoveredNode}
          />
          <AnnotationLinks
            annotations={state.annotations}
            satellitePositions={satellitePositions}
            chain={chain}
          />
          <AnnotationSatellites
            annotations={state.annotations}
            satellitePositions={satellitePositions}
            chain={chain}
            onHover={setHover}
            onClick={handleSatelliteClick}
          />
        </svg>
      ) : null}
    </div>
  );
}
