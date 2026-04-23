import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Annotation, GraphItem, NodeKind, ParagraphId } from '../types.js';
import { buildItems, computeChainSet, layoutGraph, stationRadius, type ChainSet, type GraphLayout } from '../internal/graph-layout.js';
import { AxisMarks, Edges } from '../internal/graph-svg.js';
import { Nodes } from '../internal/graph-node-svg.js';
import { RouteColumns } from '../internal/graph-columns-svg.js';
import { GraphControls } from '../internal/graph-controls.js';
import { useGraphZoom } from '../hooks/useGraphZoom.js';
import { AnnotationSatellites } from '../internal/annotation-satellites.js';
import { AnnotationLinks } from '../internal/annotation-links.js';
import { computeSatellitePositions } from '../internal/annotation-layout.js';
import { useMemoryGraphContext } from './context.js';

export type { ChainSet };

/** Context passed to the consumer-provided `renderNode` override. */
export interface RenderNodeContext { r: number; kind: NodeKind }

export interface GraphProps {
  className?: string;
  style?: CSSProperties;
  /** Delay between `closePanel()` and `scrollIntoView` on node click. Default 200ms. */
  jumpDelayMs?: number;
  /** Called in addition to the default jump behavior with the clicked id. */
  onNodeClick?: (paraId: ParagraphId) => void;
  /** Per-node SVG escape hatch. Return `null` to fall back to the default
   * kind shape. Pulse, pinned ring, highlight ring + order label stay
   * library-managed. Useful to avoid polluting `NodeKind` with
   * consumer-specific values (theme toggles, KPI tiles). */
  renderNode?: (item: GraphItem, ctx: RenderNodeContext) => ReactNode | null;
  /** Column-label formatter. Default: strip leading slash + uppercase. */
  renderRouteLabel?: (route: string) => string;
  /** Filter the view to this site. Undefined = show all (default). */
  site?: string;
}

const ROUTE_LABEL_MAX_CHARS = 16;

/** Takes the last meaningful path segment, uppercases, truncates to
 * avoid column-label collisions on deep URLs. Override via the
 * `renderRouteLabel` prop for custom semantics. */
const defaultRouteLabel = (route: string): string => {
  const segments = route.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return 'HOME';
  const upper = last.toUpperCase().replace(/[-_]/g, ' ');
  return upper.length > ROUTE_LABEL_MAX_CHARS
    ? `${upper.slice(0, ROUTE_LABEL_MAX_CHARS - 1)}…`
    : upper;
};

/** SVG reading graph. Click-to-scroll on nodes. Switches to 2D columns
 * when ≥ 2 unique routes accumulate, one column per route in
 * chronological first-visit order ; graph wrap gains horizontal scroll. */
export function Graph(props: GraphProps) {
  const {
    className,
    style,
    jumpDelayMs = 200,
    onNodeClick,
    renderNode,
    renderRouteLabel = defaultRouteLabel,
    site,
  } = props;
  const {
    config,
    state,
    showPassages,
    currentParaId,
    route: currentRoute,
    zoneElement,
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
    () => layoutGraph(items, svgWidth, config, site !== undefined ? { site } : undefined),
    [items, svgWidth, config, site],
  );

  const { zoom, canZoomIn, canZoomOut, zoomIn, zoomOut, fit } = useGraphZoom(
    wrapRef,
    layout,
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
        const root = zoneElement ?? document.body;
        const el = root.querySelector<HTMLElement>(
          `[data-mg-id="${CSS.escape(paraId)}"]`,
        );
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => triggerFlash(paraId), jumpDelayMs);
      }, jumpDelayMs);
    },
    [closePanel, jumpDelayMs, onNodeClick, triggerFlash, zoneElement],
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
        const root = zoneElement ?? document.body;
        const el = root.querySelector<HTMLElement>(
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
      zoneElement,
    ],
  );

  const satellitePositions = useMemo(
    () => (layout ? computeSatellitePositions(layout.positions, state.annotations, nodeRadiusFor) : new Map()),
    [layout, nodeRadiusFor, state.annotations],
  );

  const chain = useMemo<ChainSet | null>(
    () =>
      hoveredNodeId
        ? computeChainSet(hoveredNodeId, state.edges, state.annotations, state.nodes)
        : null,
    [hoveredNodeId, state.edges, state.annotations, state.nodes],
  );

  const routeByNode = useMemo(() => {
    const m = new Map<ParagraphId, string | undefined>();
    for (const [id, node] of state.nodes) m.set(id, node.route);
    return m;
  }, [state.nodes]);

  const base = className ? `mg-graph-wrap ${className}` : 'mg-graph-wrap';
  const multiColumn = Boolean(layout?.columns);

  // Auto-follow · when the current route changes, center its column in
  // the horizontal scroll viewport. Smooth, so the move reads as
  // "the graph is listening to where you are."
  useEffect(() => {
    if (!multiColumn || !layout?.columns || !currentRoute) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const col = layout.columns.find((c) => c.route === currentRoute);
    if (!col) return;
    const target = Math.max(0, col.centerX * zoom - wrap.clientWidth / 2);
    wrap.scrollTo({ left: target, behavior: 'smooth' });
  }, [currentRoute, multiColumn, layout, zoom]);

  return (
    <div className="mg-graph-container" style={style}>
      {layout ? (
        <GraphControls
          zoom={zoom}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFit={fit}
        />
      ) : null}
      <div
        className={base}
        ref={wrapRef}
        data-mg-graph-wrap
        data-mg-multi-column={multiColumn ? '' : undefined}
      >
      {layout ? (
        <svg
          className="mg-svg"
          viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
          height={layout.totalHeight * zoom}
          width={layout.totalWidth * zoom}
          style={{ width: layout.totalWidth * zoom, height: layout.totalHeight * zoom }}
          role="img"
          aria-label="Reading memory graph"
          data-mg-chain-active={chain ? '' : undefined}
        >
          <RouteColumns
            layout={layout}
            currentRoute={currentRoute}
            renderRouteLabel={renderRouteLabel}
          />

          <AxisMarks layout={layout} svgWidth={layout.totalWidth} paddingTop={config.GRAPH_PADDING_TOP} />
          <Edges
            edges={state.edges}
            layout={layout}
            returnBend={config.RETURN_BEND}
            chain={chain}
            routeByNode={routeByNode}
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
            {...(renderNode ? { renderNode } : {})}
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
    </div>
  );
}
