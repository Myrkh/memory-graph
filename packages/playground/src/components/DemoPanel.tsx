import { MemoryGraph } from '@myrkh/memory-graph';
import { ThemeToggleNode } from './ThemeToggleNode.js';

/**
 * Panel + all chrome — rendered once at App level as a singleton sibling
 * of `<MemoryGraph.Root>`'s children. Uses the canonical `<StandardBody>`
 * composition from the lib so playground + extension stay in lockstep
 * (single source of truth for the default panel layout).
 */
export function DemoPanel() {
  return (
    <>
      <MemoryGraph.Backdrop />
      <MemoryGraph.Panel>
        <MemoryGraph.StandardBody
          titleActions={
            <>
              <MemoryGraph.AnnotationsTrackToggle />
              <MemoryGraph.CloseButton />
            </>
          }
          renderNode={(item, ctx) =>
            item.id === 'ui-theme-toggle' ? <ThemeToggleNode r={ctx.r} /> : null
          }
          onBeforeClear={() =>
            window.confirm('Clear your memory graph for this page?')
          }
        />
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
