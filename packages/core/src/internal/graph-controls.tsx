import { FitIcon, ZoomInIcon, ZoomOutIcon } from './graph-control-icons.js';

export interface GraphControlsProps {
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

/**
 * Graph zoom toolbar · three pills overlaid top-right of the graph area.
 * Restrained opacity at rest (0.55), full opacity when the graph container
 * is hovered or focused (discoverability without clutter). All motion,
 * colors, radii token-driven. Disabled states at zoom limits. Native
 * `title` tooltips expose the keyboard shortcuts.
 */
export function GraphControls(props: GraphControlsProps) {
  const { canZoomIn, canZoomOut, onZoomIn, onZoomOut, onFit } = props;
  return (
    <div className="mg-graph-controls" role="toolbar" aria-label="Graph zoom">
      <button
        type="button"
        className="mg-graph-control"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom out"
        title="Zoom out · ⌘−"
      >
        <ZoomOutIcon />
      </button>
      <button
        type="button"
        className="mg-graph-control mg-graph-control--fit"
        onClick={onFit}
        aria-label="Fit to view"
        title="Fit to view · ⌘0"
      >
        <FitIcon />
      </button>
      <button
        type="button"
        className="mg-graph-control"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom in"
        title="Zoom in · ⌘+"
      >
        <ZoomInIcon />
      </button>
    </div>
  );
}
