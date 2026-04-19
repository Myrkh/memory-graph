import { useSyncExternalStore } from 'react';
import { PLAYGROUND_PAGES, PlaygroundNav } from './components/PlaygroundNav.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { PermanentPage } from './pages/01-permanent.js';
import { GhostPage } from './pages/02-ghost.js';
import { NonePage } from './pages/03-none.js';

const DEFAULT_HASH = '01-permanent';
const VALID_HASHES = new Set(PLAYGROUND_PAGES.map((p) => p.hash));

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

export function App() {
  const hash = useHash();
  return (
    <>
      {renderPage(hash)}
      <ThemeToggle />
      <PlaygroundNav current={hash} />
    </>
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
