import { useEffect, useSyncExternalStore } from 'react';
import { MemoryGraph } from '@myrkh/memory-graph';
import { DemoPanel } from './components/DemoPanel.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { ScrollProgress } from './sections/ScrollProgress.js';
import { TopNav } from './sections/TopNav.js';
import { HomePage } from './pages/00-home.js';
import { DemoPage } from './pages/10-demo.js';
import { DocsPage } from './pages/20-docs.js';
import { PhilosophyPage } from './pages/30-philosophy.js';

const DEFAULT_HASH = 'home';
const GLOBAL_STORAGE_KEY = 'mg-playground:global';

const ROUTES = new Set(['home', 'demo', 'docs', 'philosophy']);

/** Legacy hashes from the pre-site playground — redirect gracefully. */
const LEGACY_TO_DEMO = new Set(['01-permanent', '02-ghost', '03-none']);

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function getSnapshot(): string {
  const raw = window.location.hash.slice(1);
  if (ROUTES.has(raw)) return raw;
  if (LEGACY_TO_DEMO.has(raw)) return 'demo';
  return DEFAULT_HASH;
}

function getServerSnapshot(): string {
  return DEFAULT_HASH;
}

function useHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Site shell. A single `<MemoryGraph.Root>` owns the reading-graph state
 * and lives at the top of the app — Provider-at-root pattern (same idea
 * as `<QueryClientProvider>`). The `<DemoPanel>` + all floating chrome
 * render as singletons at shell level, so their state is stable across
 * route changes (the panel stays open when you hop from Demo to Docs,
 * the graph data persists, annotations survive navigation).
 */
export function App() {
  const hash = useHash();

  // Scroll back to the top on every route change. The actual view
  // transition (directional slide) is set up in `utils/navigation.ts` at
  // click time — by the time this effect runs, the DOM has already
  // committed, so all we do here is restore scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [hash]);

  return (
    <MemoryGraph.Root storageKey={GLOBAL_STORAGE_KEY}>
      <ScrollProgress />
      <TopNav current={hash} />
      {renderPage(hash)}
      <ThemeToggle />
      <DemoPanel />
    </MemoryGraph.Root>
  );
}

function renderPage(hash: string) {
  switch (hash) {
    case 'demo':
      return <DemoPage key="demo" />;
    case 'docs':
      return <DocsPage key="docs" />;
    case 'philosophy':
      return <PhilosophyPage key="philosophy" />;
    default:
      return <HomePage key="home" />;
  }
}
