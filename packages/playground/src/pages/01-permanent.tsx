import { MemoryGraph } from '@stitclaude/memory-graph';
import { DemoEssay, DemoPanel } from '../components/DemoEssay.js';

const STORAGE_KEY = 'mg-playground:01-permanent';

export function PermanentPage() {
  return (
    <MemoryGraph.Root storageKey={STORAGE_KEY}>
      <DemoEssay kicker="Variant · Permanent (default)" />
      <MemoryGraph.Handle variant="permanent" label="Memory Graph" />
      <DemoPanel />
    </MemoryGraph.Root>
  );
}
