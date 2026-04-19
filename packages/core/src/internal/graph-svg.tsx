import type { Edge, ParagraphId } from '../types.js';
import type { GraphLayout, Position } from './graph-layout.js';
import { stationRadius } from './graph-layout.js';
import type { HoverState } from '../primitives/context.js';
import type { ChainSet } from '../primitives/Graph.js';

const TIME_HEIGHT_PX = 600;
const AXIS_X_INSET = 24;

/* ---------------------------------------------------------------------- */

export interface AxisMarksProps {
  layout: GraphLayout;
  svgWidth: number;
  paddingTop: number;
}

export function AxisMarks(props: AxisMarksProps) {
  const { layout, svgWidth, paddingTop } = props;
  return (
    <g>
      {layout.minuteMarks.map((t) => {
        const y = paddingTop + ((t - layout.firstTime) / layout.duration) * TIME_HEIGHT_PX;
        return (
          <line
            key={t}
            className="mg-axis-line"
            x1={AXIS_X_INSET}
            y1={y}
            x2={svgWidth - AXIS_X_INSET}
            y2={y}
          />
        );
      })}
    </g>
  );
}

/* ---------------------------------------------------------------------- */

export interface EdgesProps {
  edges: Edge[];
  layout: GraphLayout;
  returnBend: number;
  chain?: ChainSet | null;
}

export function Edges(props: EdgesProps) {
  const { edges, layout, returnBend, chain } = props;
  return (
    <g>
      {edges.map((e, i) => {
        const from = layout.positions.get(e.from);
        const to = layout.positions.get(e.to);
        if (!from || !to) return null;
        // Strict chain: edge highlights iff it TOUCHES the hovered node,
        // not merely because both its endpoints are in the 1-hop set.
        const inChain = chain
          ? e.from === chain.hoveredId || e.to === chain.hoveredId
          : false;
        const chainAttr = inChain ? { 'data-mg-chain-connected': '' } : {};
        if (e.kind === 'return') {
          const midY = (from.y + to.y) / 2;
          const ctrlX = Math.max(from.x, to.x) + returnBend;
          return (
            <path
              key={i}
              className="mg-return-edge"
              d={`M ${from.x} ${from.y} Q ${ctrlX} ${midY} ${to.x} ${to.y}`}
              {...chainAttr}
            />
          );
        }
        return (
          <line
            key={i}
            className="mg-forward-edge"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            {...chainAttr}
          />
        );
      })}
    </g>
  );
}

/* ---------------------------------------------------------------------- */

export interface NodesProps {
  layout: GraphLayout;
  maxMs: number;
  currentParaId: ParagraphId | null;
  hoveredNodeId: ParagraphId | null;
  chain?: ChainSet | null;
  passageR: number;
  minR: number;
  maxR: number;
  onClick: (paraId: ParagraphId) => void;
  onHover: (state: HoverState | null) => void;
  onHoverNode: (paraId: ParagraphId | null) => void;
}

export function Nodes(props: NodesProps) {
  const {
    layout,
    maxMs,
    currentParaId,
    hoveredNodeId,
    chain,
    passageR,
    minR,
    maxR,
    onClick,
    onHover,
    onHoverNode,
  } = props;
  return (
    <g>
      {[...layout.positions.entries()].map(([id, pos]) => (
        <Node
          key={id}
          id={id}
          pos={pos}
          maxMs={maxMs}
          isCurrent={id === currentParaId}
          isHighlighted={id === hoveredNodeId}
          inChain={chain ? chain.nodes.has(id) : false}
          passageR={passageR}
          minR={minR}
          maxR={maxR}
          onClick={onClick}
          onHover={onHover}
          onHoverNode={onHoverNode}
        />
      ))}
    </g>
  );
}

interface NodeProps {
  id: ParagraphId;
  pos: Position;
  maxMs: number;
  isCurrent: boolean;
  isHighlighted: boolean;
  inChain: boolean;
  passageR: number;
  minR: number;
  maxR: number;
  onClick: (paraId: ParagraphId) => void;
  onHover: (state: HoverState | null) => void;
  onHoverNode: (paraId: ParagraphId | null) => void;
}

function Node(props: NodeProps) {
  const {
    id,
    pos,
    maxMs,
    isCurrent,
    isHighlighted,
    inChain,
    passageR,
    minR,
    maxR,
    onClick,
    onHover,
    onHoverNode,
  } = props;
  const { item } = pos;
  const isStation = item.type === 'station';
  const r = isStation ? stationRadius(item.totalMs, maxMs, minR, maxR) : passageR;
  const pinnedAttr = item.pinned ? { 'data-mg-pinned': '' } : {};
  const currentAttr = isCurrent && isStation ? { 'data-mg-current': '' } : {};
  const highlightAttr = isHighlighted ? { 'data-mg-highlight': '' } : {};
  const chainAttr = inChain ? { 'data-mg-chain-connected': '' } : {};
  const typeAttr = { 'data-mg-type': item.type };

  return (
    <g
      className="mg-node"
      transform={`translate(${pos.x},${pos.y})`}
      onClick={() => onClick(id)}
      onMouseEnter={(e) => {
        onHover({ kind: 'node', item, clientX: e.clientX, clientY: e.clientY });
        onHoverNode(id);
      }}
      onMouseMove={(e) =>
        onHover({ kind: 'node', item, clientX: e.clientX, clientY: e.clientY })
      }
      onMouseLeave={() => {
        onHover(null);
        onHoverNode(null);
      }}
      {...typeAttr}
      {...pinnedAttr}
      {...currentAttr}
      {...highlightAttr}
      {...chainAttr}
    >
      {isCurrent && isStation ? (
        <circle className="mg-node-pulse" cx={0} cy={0} r={5} />
      ) : null}
      {item.pinned ? (
        <circle
          className="mg-node-ring"
          cx={0}
          cy={0}
          r={isStation ? r + 4 : passageR + 3}
        />
      ) : null}
      {isHighlighted ? (
        <circle
          className="mg-node-highlight-ring"
          cx={0}
          cy={0}
          r={isStation ? r + 4 : passageR + 4}
        />
      ) : null}
      <circle className="mg-node-circle" cx={0} cy={0} r={r} />
      {isStation && r >= 7 ? (
        <text className="mg-node-order" x={0} y={0}>
          {String(item.order + 1).padStart(2, '0')}
        </text>
      ) : null}
    </g>
  );
}
