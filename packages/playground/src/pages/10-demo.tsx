import { useState } from 'react';
import { MemoryGraph, useMemoryGraphContext } from '@myrkh/memory-graph';
import { DemoEssay } from '../components/DemoEssay.js';
import { DemoIntro } from '../sections/DemoIntro.js';
import { SiteFooter } from '../sections/SiteFooter.js';

type Variant = 'permanent' | 'ghost' | 'none';

/**
 * Demo page — the existing editorial essay wired to the library, with
 * live Handle variant switching. Switching variants re-keys the Handle
 * so the new variant mounts fresh; the graph state persists across
 * switches because `<Root>` stays up at the app shell level.
 */
export function DemoPage() {
  const [variant, setVariant] = useState<Variant>('permanent');

  return (
    <main className="site-page site-page--demo">
      <DemoIntro variant={variant} onVariantChange={setVariant} />

      <DemoEssay kicker={kickerFor(variant)} aside={variant === 'none' ? <CustomOpenBtn /> : undefined} />

      {variant === 'none' ? (
        <MemoryGraph.Handle key="none" variant="none" />
      ) : (
        <MemoryGraph.Handle key={variant} variant={variant} label="Memory Graph" />
      )}

      <SiteFooter />
    </main>
  );
}

function kickerFor(variant: Variant): string {
  if (variant === 'ghost') return 'Variant · Ghost · hover left edge to reveal';
  if (variant === 'none') return 'Variant · Keyboard-only (⌘M) or custom trigger';
  return 'Variant · Permanent · default';
}

function CustomOpenBtn() {
  const { openPanel } = useMemoryGraphContext();
  return (
    <button type="button" className="pg-open-btn" onClick={openPanel}>
      <span className="pg-open-btn__dot" aria-hidden />
      <span>Open Memory Graph</span>
      <kbd>⌘M</kbd>
    </button>
  );
}
