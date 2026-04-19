import { MemoryGraph, useMemoryGraphContext } from '@stitclaude/memory-graph';
import { DemoEssay, DemoPanel } from '../components/DemoEssay.js';

const STORAGE_KEY = 'mg-playground:03-none';

export function NonePage() {
  return (
    <MemoryGraph.Root storageKey={STORAGE_KEY}>
      <DemoEssay
        kicker="Variant · None · keyboard-only (⌘M) or custom trigger"
        aside={<CustomOpenButton />}
      />
      <MemoryGraph.Handle variant="none" />
      <DemoPanel />
    </MemoryGraph.Root>
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
