import { MemoryGraph, useMemoryGraphContext } from '@myrkh/memory-graph';
import { ThemeToggleNode } from './ThemeToggleNode.js';

/**
 * Panel + all chrome — rendered once at App level as a singleton sibling
 * of `<MemoryGraph.Root>`'s children. Identical across every variant page;
 * only the trigger mechanism (Handle variant, custom button…) changes at
 * the page level.
 */
export function DemoPanel() {
  return (
    <>
      <MemoryGraph.Backdrop />
      <MemoryGraph.Panel>
        <MemoryGraph.Head>
          <MemoryGraph.TitleRow>
            <MemoryGraph.Title>
              Memory <em>Graph</em>
            </MemoryGraph.Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MemoryGraph.AnnotationsTrackToggle />
              <MemoryGraph.CloseButton />
            </div>
          </MemoryGraph.TitleRow>
          <MemoryGraph.Stats />
        </MemoryGraph.Head>
        <MemoryGraph.DeepestIndicator />
        <GraphOrEmpty />
        <MemoryGraph.IntensitySparkline />
        <MemoryGraph.Footer>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.ClearButton
              onBeforeClear={() => window.confirm('Clear your memory graph for this page?')}
            />
            <MemoryGraph.ExportButton />
          </MemoryGraph.FooterGroup>
          <MemoryGraph.FooterGroup>
            <MemoryGraph.PassagesToggle />
          </MemoryGraph.FooterGroup>
        </MemoryGraph.Footer>
      </MemoryGraph.Panel>
      <MemoryGraph.AnnotationsTrack />
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.LinkReveal />
      <MemoryGraph.PinToast />
      <MemoryGraph.Tooltip />
      <MemoryGraph.KeyboardShortcuts />
    </>
  );
}

function GraphOrEmpty() {
  const { derived, showPassages, state } = useMemoryGraphContext();
  const hasContent = derived.stationCount > 0 || (showPassages && state.passages.size > 0);
  if (!hasContent) return <MemoryGraph.Empty />;
  return (
    <MemoryGraph.Graph
      renderNode={(item, ctx) =>
        item.id === 'ui-theme-toggle' ? <ThemeToggleNode r={ctx.r} /> : null
      }
    />
  );
}
