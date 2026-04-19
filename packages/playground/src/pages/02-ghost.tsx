import { MemoryGraph } from '@stitclaude/memory-graph';
import { DemoEssay, DemoPanel } from '../components/DemoEssay.js';

const STORAGE_KEY = 'mg-playground:02-ghost';

export function GhostPage() {
  return (
    <MemoryGraph.Root storageKey={STORAGE_KEY}>
      <DemoEssay kicker="Variant · Ghost · hover left edge to reveal" />
      <MemoryGraph.Handle variant="ghost" label="Memory Graph" />
      <DemoPanel />
    </MemoryGraph.Root>
  );
}
