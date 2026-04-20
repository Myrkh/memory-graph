import { useSyncExternalStore } from 'react';
import { MemoryGraph } from '@myrkh/memory-graph';
import { PLAYGROUND_PAGES, PlaygroundNav } from './components/PlaygroundNav.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { DemoPanel } from './components/DemoPanel.js';
import { PermanentPage } from './pages/01-permanent.js';
import { GhostPage } from './pages/02-ghost.js';
import { NonePage } from './pages/03-none.js';

const DEFAULT_HASH = '01-permanent';
const VALID_HASHES = new Set(PLAYGROUND_PAGES.map((p) => p.hash));
const GLOBAL_STORAGE_KEY = 'mg-playground:global';

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function getSnapshot(): string {
  const raw = window.location.hash.slice(1);
  return VALID_HASHES.has(raw) ? raw : DEFAULT_HASH;
}

function getServerSnapshot(): string {
  return DEFAULT_HASH;
}

function useHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Provider-at-root pattern (canonical for stateful libs: cf. Radix,
 * TanStack Query, shadcn theme). `<MemoryGraph.Root>` wraps the whole
 * app once; pages only declare their essay content + their Handle variant.
 * The panel and all its siblings live here as singletons, so panel open
 * state + graph data persist as the user navigates between variants.
 */
export function App() {
  const hash = useHash();
  return (
    <MemoryGraph.Root storageKey={GLOBAL_STORAGE_KEY}>
      {renderPage(hash)}
      <ThemeToggle />
      <PlaygroundNav current={hash} />
      <DemoPanel />
    </MemoryGraph.Root>
  );
}

function renderPage(hash: string) {
  switch (hash) {
    case '02-ghost':
      return <GhostPage key="02-ghost" />;
    case '03-none':
      return <NonePage key="03-none" />;
    default:
      return <PermanentPage key="01-permanent" />;
  }
}
