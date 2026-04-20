import type { Edge } from '../types.js';
import type { GraphLayout } from './graph-layout.js';
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
      {edges.map((e) => {
        const from = layout.positions.get(e.from);
        const to = layout.positions.get(e.to);
        if (!from || !to) return null;
        // Composite key — stable across any future edge reordering.
        // `(from, to, at)` is unique because re-visits emit distinct timestamps.
        const key = `${e.from}→${e.to}→${e.kind}→${e.at}`;
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
              key={key}
              className="mg-return-edge"
              d={`M ${from.x} ${from.y} Q ${ctrlX} ${midY} ${to.x} ${to.y}`}
              {...chainAttr}
            />
          );
        }
        return (
          <line
            key={key}
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

export { Nodes } from './graph-node-svg.js';
export type { NodesProps } from './graph-node-svg.js';
