import { MemoryGraph } from '@myrkh/memory-graph';
import { DemoEssay } from '../components/DemoEssay.js';

export function PermanentPage() {
  return (
    <>
      <DemoEssay kicker="Variant · Permanent (default)" />
      <MemoryGraph.Handle variant="permanent" label="Memory Graph" />
    </>
  );
}
