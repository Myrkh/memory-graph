import type { GraphLayout } from './graph-layout.js';

export interface RouteColumnsProps {
  layout: GraphLayout;
  /** Current route (from `<Root route="…">`) — lights up the matching column. */
  currentRoute: string | undefined;
  /** Transform a raw route string into its display label. */
  renderRouteLabel: (route: string) => string;
}

/**
 * Column chrome for the 2D graph layout · tint rectangles, dashed
 * separators between columns, and mono uppercase route labels at the
 * top. Only mounted when `layout.columns` is present (≥ 2 unique
 * routes). All colors come from `--mg-*` tokens; the only motion is
 * opacity on the current-route tint.
 */
export function RouteColumns(props: RouteColumnsProps) {
  const { layout, currentRoute, renderRouteLabel } = props;
  const columns = layout.columns;
  if (!columns) return null;

  return (
    <g className="mg-route-columns">
      {columns.map((col) => {
        const isCurrent = col.route === currentRoute;
        const currentAttr = isCurrent ? { 'data-mg-current': '' } : {};
        return (
          <g
            key={col.route}
            className="mg-route-column"
            data-mg-route={col.route}
            {...currentAttr}
          >
            <rect
              className="mg-route-column-tint"
              x={col.centerX - col.width / 2}
              y={0}
              width={col.width}
              height={layout.totalHeight}
            />
          </g>
        );
      })}
      {columns.slice(1).map((col) => (
        <line
          key={`sep-${col.route}`}
          className="mg-route-separator"
          x1={col.centerX - col.width / 2}
          y1={0}
          x2={col.centerX - col.width / 2}
          y2={layout.totalHeight}
        />
      ))}
      {columns.map((col) => (
        <text
          key={`label-${col.route}`}
          className="mg-route-label"
          x={col.centerX}
          y={18}
        >
          {renderRouteLabel(col.route)}
        </text>
      ))}
    </g>
  );
}
