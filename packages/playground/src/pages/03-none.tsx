import { MemoryGraph, useMemoryGraphContext } from '@myrkh/memory-graph';
import { DemoEssay } from '../components/DemoEssay.js';

export function NonePage() {
  return (
    <>
      <DemoEssay
        kicker="Variant · None · keyboard-only (⌘M) or custom trigger"
        aside={<CustomOpenButton />}
      />
      <MemoryGraph.Handle variant="none" />
    </>
  );
}

/**
 * Demonstrates the imperative API. With `variant="none"` no Handle is
 * rendered, so the consumer must provide its own way to open the panel —
 * here, a pill button in the intro that calls `openPanel()` from context.
 */
function CustomOpenButton() {
  const { openPanel } = useMemoryGraphContext();
  return (
    <button type="button" className="pg-open-btn" onClick={openPanel}>
      <span className="pg-open-btn__dot" aria-hidden />
      <span>Open Memory Graph</span>
      <kbd>⌘M</kbd>
    </button>
  );
}
