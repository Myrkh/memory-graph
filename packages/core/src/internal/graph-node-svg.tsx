import type { ReactNode } from 'react';
import type { GraphItem, NodeKind, ParagraphId } from '../types.js';
import type { ChainSet, GraphLayout, Position } from './graph-layout.js';
import { stationRadius } from './graph-layout.js';
import type { HoverState } from '../primitives/context.js';
import type { RenderNodeContext } from '../primitives/Graph.js';

/**
 * Per-kind node rendering for the Graph SVG. Five geometric kinds share
 * one accent/stroke grammar; each `<NodeShape>` stays centered on (0,0)
 * and covers roughly the same visual footprint as the canonical circle,
 * so edges, pulse, rings and the order label stay aligned regardless of
 * kind. `<NodeRing>` mirrors the shape geometry so pinned / hover /
 * highlight outlines read as *the same* coral signature on a square,
 * diamond or rounded-square as on a circle.
 */

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
  /** Optional per-node shape override forwarded from `<Graph>`. */
  renderNode?: (item: GraphItem, ctx: RenderNodeContext) => ReactNode | null;
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
    renderNode,
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
          {...(renderNode ? { renderNode } : {})}
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
  renderNode?: (item: GraphItem, ctx: RenderNodeContext) => ReactNode | null;
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
    renderNode,
  } = props;
  const { item } = pos;
  const isStation = item.type === 'station';
  const r = isStation ? stationRadius(item.totalMs, maxMs, minR, maxR) : passageR;
  const kind: NodeKind = isStation ? item.kind ?? 'paragraph' : 'paragraph';
  const pinnedAttr = item.pinned ? { 'data-mg-pinned': '' } : {};
  const currentAttr = isCurrent && isStation ? { 'data-mg-current': '' } : {};
  const highlightAttr = isHighlighted ? { 'data-mg-highlight': '' } : {};
  const chainAttr = inChain ? { 'data-mg-chain-connected': '' } : {};
  const typeAttr = { 'data-mg-type': item.type };
  const kindAttr = isStation ? { 'data-mg-kind': kind } : {};
  const routeAttr = isStation && item.route ? { 'data-mg-route': item.route } : {};
  const customShape = renderNode?.(item, { r, kind });

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
      {...kindAttr}
      {...routeAttr}
      {...pinnedAttr}
      {...currentAttr}
      {...highlightAttr}
      {...chainAttr}
    >
      {isCurrent && isStation ? (
        <circle className="mg-node-pulse" cx={0} cy={0} r={5} />
      ) : null}
      {item.pinned ? (
        <NodeRing r={isStation ? r + 4 : passageR + 3} kind={kind} className="mg-node-ring" />
      ) : null}
      {isHighlighted ? (
        <NodeRing
          r={isStation ? r + 4 : passageR + 4}
          kind={kind}
          className="mg-node-highlight-ring"
        />
      ) : null}
      {customShape !== null && customShape !== undefined ? (
        customShape
      ) : (
        <NodeShape r={r} kind={isStation ? kind : 'paragraph'} />
      )}
      {isStation && r >= 7 ? (
        <text className="mg-node-order" x={0} y={0}>
          {String(item.order + 1).padStart(2, '0')}
        </text>
      ) : null}
    </g>
  );
}

function NodeShape({ r, kind }: { r: number; kind: NodeKind }) {
  if (kind === 'kpi') {
    return <rect className="mg-node-shape" x={-r} y={-r} width={r * 2} height={r * 2} />;
  }
  if (kind === 'code') {
    return (
      <rect
        className="mg-node-shape"
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        rx={2}
        ry={2}
      />
    );
  }
  if (kind === 'figure') {
    const d = r * 1.05;
    return (
      <rect
        className="mg-node-shape"
        x={-d}
        y={-d}
        width={d * 2}
        height={d * 2}
        transform="rotate(45)"
      />
    );
  }
  if (kind === 'heading') {
    return (
      <>
        <circle className="mg-node-shape-halo" cx={0} cy={0} r={r + 3} />
        <circle className="mg-node-shape" cx={0} cy={0} r={r} />
      </>
    );
  }
  return <circle className="mg-node-shape" cx={0} cy={0} r={r} />;
}

function NodeRing({
  r,
  kind,
  className,
}: {
  r: number;
  kind: NodeKind;
  className: string;
}) {
  if (kind === 'kpi') {
    return <rect className={className} x={-r} y={-r} width={r * 2} height={r * 2} />;
  }
  if (kind === 'code') {
    return (
      <rect
        className={className}
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        rx={3}
        ry={3}
      />
    );
  }
  if (kind === 'figure') {
    return (
      <rect
        className={className}
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        transform="rotate(45)"
      />
    );
  }
  return <circle className={className} cx={0} cy={0} r={r} />;
}
