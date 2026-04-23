import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { useMemoryGraphContext } from './context.js';
import type { Node, ParagraphId } from '../types.js';
import { GraphControls } from '../internal/graph-controls.js';

export interface ConstellationProps {
  /** Called when the user clicks a super-node · typically switches the
   * per-site view to that site in the consumer's `<TypewriterTabs>`. */
  onSiteClick?: (siteOrigin: string) => void;
  className?: string;
  style?: CSSProperties;
}

interface SiteAggregate {
  origin: string;
  firstSeenAt: number;
  lastSeenAt: number;
  totalMs: number;
  stationCount: number;
}

interface StarPosition {
  site: SiteAggregate;
  x: number;
  y: number;
  r: number;
}

const GOLDEN_ANGLE = 137.5077640500378; // Phyllotaxis · Fibonacci spiral
const VIEWBOX = 400;
const CENTER = VIEWBOX / 2;
const SMALL_N_THRESHOLD = 6;
const SMALL_N_RADIUS = 110; // fixed ring radius for ≤ N sites — breathes
const BASE_RADIUS = 48; // sunflower base for > SMALL_N_THRESHOLD sites
const MIN_STAR = 9;
const MAX_STAR = 22;

/**
 * Constellation view · the `∑ all` visualisation when the user wants a
 * meta-scale picture of their reading across every site. Sunflower
 * phyllotaxis (golden-angle spiral) positions one super-node per site
 * deterministically : no re-render drift, same user → same layout.
 *
 * Encodings :
 *   · size   = `totalMs` of the site (more time → bigger disc)
 *   · radius = index in chronological `firstSeenAt` order (older sites
 *              sit near the center, newer sites spiral outward)
 *   · arcs   = dashed coral between sites between which the user has
 *              navigated (one or more edges cross the site boundary)
 *
 * Motion (Stit'Claude) :
 *   · stars fade in staggered by chronological index on mount
 *   · hover inflates the star + its ego-arcs brighten
 *
 * Pure render primitive — consumer decides when to show it.
 */
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.15;

export function Constellation(props: ConstellationProps) {
  const { onSiteClick, className, style } = props;
  const { state } = useMemoryGraphContext();

  const sites = useSiteAggregates(state.nodes);
  const { positions, maxTotal } = useSunflowerLayout(sites);
  const arcs = useInterSiteArcs(state.edges, state.nodes, positions);

  const [zoom, setZoom] = useState(1);
  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)),
    [],
  );
  const fit = useCallback(() => setZoom(1), []);

  if (positions.length === 0) {
    return (
      <div className="mg-constellation mg-constellation--empty" style={style}>
        <p>No sites tracked yet. Read on two or more sites to see the map.</p>
      </div>
    );
  }

  const base = className ? `mg-constellation ${className}` : 'mg-constellation';

  return (
    <div className="mg-graph-container" style={style}>
      <GraphControls
        zoom={zoom}
        canZoomIn={zoom < MAX_ZOOM - 0.001}
        canZoomOut={zoom > MIN_ZOOM + 0.001}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={fit}
      />
      <div className={base}>
        <svg
          className="mg-constellation__svg"
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Cross-site reading constellation"
        >
          <g
            className="mg-constellation__zoom"
            style={{
              transform: `translate(${CENTER}px, ${CENTER}px) scale(${zoom}) translate(${-CENTER}px, ${-CENTER}px)`,
              transformOrigin: '0 0',
              transition:
                'transform var(--mg-duration-moderate, 280ms) var(--mg-ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1))',
            }}
          >
            {/* Dashed coral arcs · grammar match with the graph's return-edges. */}
            <g className="mg-constellation__arcs">
              {arcs.map((a) => (
                <path
                  key={a.key}
                  className="mg-constellation__arc"
                  d={a.path}
                  data-mg-weight={a.weight}
                />
              ))}
            </g>

            {/* Super-nodes · staggered fade-in via inline animation-delay. */}
            <g className="mg-constellation__stars">
              {positions.map((p, i) => (
                <Star
                  key={p.site.origin}
                  position={p}
                  delayMs={i * 40}
                  maxTotal={maxTotal}
                  {...(onSiteClick ? { onClick: onSiteClick } : {})}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Star(props: {
  position: StarPosition;
  delayMs: number;
  maxTotal: number;
  onClick?: (origin: string) => void;
}) {
  const { position, delayMs, onClick } = props;
  const { site, x, y, r } = position;
  const host = hostFromOrigin(site.origin);

  return (
    <g
      className="mg-constellation__star"
      transform={`translate(${x},${y})`}
      style={{ animationDelay: `${delayMs}ms` }}
      onClick={onClick ? () => onClick(site.origin) : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${host} — ${Math.round(site.totalMs / 1000)}s read, ${site.stationCount} stations`}
    >
      <circle className="mg-constellation__star-halo" r={r + 6} />
      <circle className="mg-constellation__star-disc" r={r} />
      <text className="mg-constellation__star-label" y={r + 14}>
        {host}
      </text>
      <text className="mg-constellation__star-stats" y={r + 25}>
        {formatDuration(site.totalMs)} · {site.stationCount}n
      </text>
    </g>
  );
}

/* -- Hooks ------------------------------------------------------------- */

function useSiteAggregates(
  nodes: Map<ParagraphId, Node>,
): SiteAggregate[] {
  return useMemo(() => {
    const map = new Map<string, SiteAggregate>();
    for (const node of nodes.values()) {
      if (!node.site) continue;
      const existing = map.get(node.site);
      if (existing) {
        existing.totalMs += node.totalMs;
        existing.stationCount++;
        if (node.firstAt < existing.firstSeenAt) existing.firstSeenAt = node.firstAt;
        if (node.firstAt > existing.lastSeenAt) existing.lastSeenAt = node.firstAt;
      } else {
        map.set(node.site, {
          origin: node.site,
          firstSeenAt: node.firstAt,
          lastSeenAt: node.firstAt,
          totalMs: node.totalMs,
          stationCount: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.firstSeenAt - b.firstSeenAt);
  }, [nodes]);
}

function useSunflowerLayout(sites: SiteAggregate[]): {
  positions: StarPosition[];
  maxTotal: number;
} {
  return useMemo(() => {
    if (sites.length === 0) return { positions: [], maxTotal: 1 };
    const maxTotal = Math.max(1, ...sites.map((s) => s.totalMs));
    const n = sites.length;
    const positions: StarPosition[] = sites.map((site, i) => {
      // For small N, evenly-spaced angles on a single ring give the
      // cleanest separation (sunflower would bunch sites 0-1 tightly).
      // For larger N, phyllotaxis spirals them out.
      let angle: number;
      let radius: number;
      if (n === 1) {
        angle = 0;
        radius = 0; // single site sits at center
      } else if (n <= SMALL_N_THRESHOLD) {
        // Evenly distributed · start at top (−90°) and go clockwise.
        angle = ((i / n) * 360 - 90) * (Math.PI / 180);
        radius = SMALL_N_RADIUS;
      } else {
        angle = i * GOLDEN_ANGLE * (Math.PI / 180);
        radius = Math.sqrt(i + 1) * BASE_RADIUS;
      }
      const x = CENTER + radius * Math.cos(angle);
      const y = CENTER + radius * Math.sin(angle);
      const r =
        MIN_STAR + (MAX_STAR - MIN_STAR) * Math.min(1, site.totalMs / maxTotal);
      return { site, x, y, r };
    });
    return { positions, maxTotal };
  }, [sites]);
}

function useInterSiteArcs(
  edges: Array<{ from: ParagraphId; to: ParagraphId; kind: string }>,
  nodes: Map<ParagraphId, Node>,
  positions: StarPosition[],
): Array<{ key: string; path: string; weight: number }> {
  return useMemo(() => {
    const byOrigin = new Map<string, StarPosition>();
    for (const p of positions) byOrigin.set(p.site.origin, p);

    const pairCounts = new Map<string, number>();
    for (const e of edges) {
      const fromSite = nodes.get(e.from)?.site;
      const toSite = nodes.get(e.to)?.site;
      if (!fromSite || !toSite || fromSite === toSite) continue;
      // Undirected · order the pair so (a,b) and (b,a) collapse.
      const [a, b] = fromSite < toSite ? [fromSite, toSite] : [toSite, fromSite];
      const key = `${a}→${b}`;
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }

    return [...pairCounts.entries()].flatMap(([key, weight]) => {
      const [a, b] = key.split('→');
      if (!a || !b) return [];
      const pa = byOrigin.get(a);
      const pb = byOrigin.get(b);
      if (!pa || !pb) return [];
      // Quadratic Bézier through a midpoint nudged toward the viewbox center —
      // keeps arcs from crossing the page frame on edge pairs.
      const mx = (pa.x + pb.x) / 2;
      const my = (pa.y + pb.y) / 2;
      const cx = mx + (CENTER - mx) * 0.35;
      const cy = my + (CENTER - my) * 0.35;
      const path = `M ${pa.x} ${pa.y} Q ${cx} ${cy} ${pb.x} ${pb.y}`;
      return [{ key, path, weight }];
    });
  }, [edges, nodes, positions]);
}

function hostFromOrigin(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h${m % 60}m`;
}
