import { useEffect, useSyncExternalStore } from 'react';
import { MemoryGraph } from '@myrkh/memory-graph';
import { DemoPanel } from './components/DemoPanel.js';
import { ScrollProgress } from './sections/ScrollProgress.js';
import { TopNav } from './sections/TopNav.js';
import { HomePage } from './pages/00-home.js';
import { DemoPage } from './pages/10-demo.js';
import { DocsPage } from './pages/20-docs.js';
import { PhilosophyPage } from './pages/30-philosophy.js';
import { pageFromPathname, pathFromPage, type Page } from './utils/navigation.js';

const GLOBAL_STORAGE_KEY = 'mg-playground:global';

const PAGE_META: Record<Page, { title: string; description: string }> = {
  home: {
    title: 'memory-graph · see how people actually read',
    description:
      'A React library that turns reading into a graph. Drop it into any app, mark the elements that matter, watch the trail form behind a slide-out panel. Multi-DOM · multi-strategy · smart defaults · zero network.',
  },
  demo: {
    title: 'Live demo · memory-graph',
    description:
      'An interactive essay wired to the memory-graph library. Scroll, linger, open the panel — stations appear for paragraphs you read, passages for those you crossed. Three Handle variants to choose from.',
  },
  docs: {
    title: 'Docs · memory-graph',
    description:
      'Three-minute quickstart + full API reference. Install, wrap your app once, mark elements with data-mg-id. Primitives, hooks, DOM attributes — everything exported by @myrkh/memory-graph.',
  },
  philosophy: {
    title: 'Philosophy · memory-graph · the five laws',
    description:
      'Zero network. Passive observation. Temporal topology only. Return-edges curve right. Three-second dwell. The non-negotiable rules that shape the library.',
  },
};

function subscribe(cb: () => void): () => void {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
}

function getSnapshot(): Page {
  return pageFromPathname(window.location.pathname);
}

function getServerSnapshot(): Page {
  return 'home';
}

function useCurrentPage(): Page {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Site shell — a single `<MemoryGraph.Root>` owns reading-graph state at
 * app level (Provider-at-root pattern). History API routing: each page
 * is a distinct `pathname` (`/`, `/demo`, `/docs`, `/philosophy`) so
 * Google indexes them as separate documents.
 *
 * Per-page `document.title` + `meta[name="description"]` are updated on
 * each route change so the browser tab, share links, and crawler
 * snippets always reflect the current page.
 */
export function App() {
  const page = useCurrentPage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const meta = PAGE_META[page];
    document.title = meta.title;
    const descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descTag) descTag.content = meta.description;
    const canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalTag) {
      const origin = window.location.origin;
      canonicalTag.href = `${origin}${window.location.pathname}`;
    }
  }, [page]);

  return (
    <MemoryGraph.Root storageKey={GLOBAL_STORAGE_KEY} route={pathFromPage(page)}>
      <ScrollProgress />
      <TopNav current={page} />
      {renderPage(page)}
      <DemoPanel />
    </MemoryGraph.Root>
  );
}

function renderPage(page: Page) {
  switch (page) {
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
