import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { Annotation, GraphItem, ParagraphId } from '../types.js';
import {
  buildItems,
  layoutGraph,
  stationRadius,
  type GraphLayout,
} from '../internal/graph-layout.js';
import { AxisMarks, Edges, Nodes } from '../internal/graph-svg.js';
import { AnnotationSatellites } from '../internal/annotation-satellites.js';
import { useMemoryGraphContext } from './context.js';

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
    setHover,
    hoveredNodeId,
    setHoveredNode,
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
    (annotation: Annotation) => jumpToParagraph(annotation.paraId),
    [jumpToParagraph],
  );

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
        >
          <AxisMarks layout={layout} svgWidth={svgWidth} paddingTop={config.GRAPH_PADDING_TOP} />
          <Edges edges={state.edges} layout={layout} returnBend={config.RETURN_BEND} />
          <Nodes
            layout={layout}
            maxMs={maxMs}
            currentParaId={currentParaId}
            hoveredNodeId={hoveredNodeId}
            passageR={config.PASSAGE_R}
            minR={config.NODE_R_MIN}
            maxR={config.NODE_R_MAX}
            onClick={jumpToParagraph}
            onHover={setHover}
            onHoverNode={setHoveredNode}
          />
          <AnnotationSatellites
            positions={layout.positions}
            annotations={state.annotations}
            nodeRadiusFor={nodeRadiusFor}
            onHover={setHover}
            onClick={handleSatelliteClick}
          />
        </svg>
      ) : null}
    </div>
  );
}
