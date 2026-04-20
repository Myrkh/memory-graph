import { MemoryGraph } from '@myrkh/memory-graph';
import { DemoEssay } from '../components/DemoEssay.js';

export function GhostPage() {
  return (
    <>
      <DemoEssay kicker="Variant · Ghost · hover left edge to reveal" />
      <MemoryGraph.Handle variant="ghost" label="Memory Graph" />
    </>
  );
}
