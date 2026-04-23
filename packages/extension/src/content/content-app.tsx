import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryGraph } from '@myrkh/memory-graph';
import { createChromeStorageAdapter } from '../shared/chrome-storage-adapter.js';
import { useThemePreference } from '../shared/use-theme-preference.js';
import { autoTagContent, watchForAutoTag } from './auto-tag.js';
import { useCurrentPathname } from './use-current-pathname.js';
// Raw CSS text · injected both in the host's <head> (so inline annotation
// `<mark>` elements on paragraphs pick up the tokens) AND inside the
// Shadow DOM (so floating UI — SelectionToolbar, Tooltip, PinToast,
// LinkReveal — render with the grammar without leaking to the host's CSS).
// All six themes are bundled at once — each is scoped to
// `[data-mg-theme="<id>"]` so none leaks when inactive, and the live
// theme swap is a single attribute flip.
import baseCss from '@myrkh/memory-graph/styles?raw';
import stitClaudeCss from '@myrkh/memory-graph/themes/stit-claude?raw';
import plexCss from '@myrkh/memory-graph/themes/plex?raw';
import solarisCss from '@myrkh/memory-graph/themes/solaris?raw';
import obsidianCss from '@myrkh/memory-graph/themes/obsidian?raw';
import kyotoCss from '@myrkh/memory-graph/themes/kyoto?raw';
import arcadeCss from '@myrkh/memory-graph/themes/arcade?raw';

const HOST_ELEMENT_ID = 'mg-ext-host';

/**
 * Content-script React app · the lib's interaction primitives running
 * directly inside each tracked page. Reads + writes the same
 * `chrome.storage.local` super-state as the side panel, so annotations
 * created on the page appear in the graph instantly (and vice-versa).
 *
 * Structure :
 *   document.documentElement
 *     └── <div id="mg-ext-host" data-mg-theme="stit-claude">       (light DOM host)
 *           └── #shadow-root (open)
 *                 ├── <style>  (base.css + theme — floating UI only)
 *                 └── <div>   (React mount point)
 *                       └── <Root persistenceAdapter={chromeStorageAdapter}>
 *                             ├── SelectionToolbar  (fixed)
 *                             ├── NoteEditor        (via SelectionToolbar)
 *                             ├── LinkReveal        (fixed SVG)
 *                             ├── Tooltip           (fixed)
 *                             └── PinToast          (fixed)
 *
 * Annotation marks (`<mark class="mg-annotation">`) are rendered by
 * `useZoneAnnotations` INTO the host page's paragraph DOM — in light
 * DOM. That's why the CSS is also injected into `document.head`.
 */

function injectCss(target: ShadowRoot | HTMLElement, css: string): void {
  const style = document.createElement('style');
  style.setAttribute('data-mg-ext-injected', '');
  style.textContent = css;
  target.appendChild(style);
}

function install(): void {
  if (document.getElementById(HOST_ELEMENT_ID)) return; // idempotent guard

  const combinedCss = [
    baseCss,
    stitClaudeCss,
    plexCss,
    solarisCss,
    obsidianCss,
    kyotoCss,
    arcadeCss,
  ].join('\n');

  // Light-DOM injection for annotation marks inside paragraphs.
  injectCss(document.head, combinedCss);

  // Shadow-DOM host for floating UI (isolated from host site's CSS).
  const host = document.createElement('div');
  host.id = HOST_ELEMENT_ID;
  host.setAttribute('data-mg-theme', 'stit-claude');
  // Annotation marks live in the light DOM — mirror the theme attribute
  // on `<body>` too so their CSS selectors match when the user swaps.
  document.body.setAttribute('data-mg-theme', 'stit-claude');
  // Keep the host from affecting layout of the page.
  host.style.cssText =
    'position:fixed;inset:0;pointer-events:none;width:0;height:0;';
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  injectCss(shadow, combinedCss);

  const mountPoint = document.createElement('div');
  // Re-enable pointer events on the mount point — the wrapper's
  // `pointer-events: none` was only there so the 0×0 host box
  // doesn't eat clicks outside the actual UI widgets.
  mountPoint.style.cssText = 'pointer-events:auto;';
  shadow.appendChild(mountPoint);

  // Auto-tag the current DOM + watch for new content.
  autoTagContent();
  watchForAutoTag();

  const adapter = createChromeStorageAdapter();

  createRoot(mountPoint).render(
    <StrictMode>
      <ContentApp adapter={adapter} />
    </StrictMode>,
  );
}

function ContentApp({
  adapter,
}: {
  adapter: ReturnType<typeof createChromeStorageAdapter>;
}) {
  // Live pathname — re-renders Root with the correct route after every
  // SPA navigation (popstate, pushState, replaceState, hashchange).
  const pathname = useCurrentPathname();
  // Theme preference shared with the sidepanel via `chrome.storage.sync`.
  // When the user picks a theme there, this content-script instance
  // receives the change through `storage.onChanged` and re-tags both
  // the shadow host (for floating UI) and `<body>` (for in-page
  // annotation marks) in a single render tick.
  const [theme] = useThemePreference();

  useEffect(() => {
    const host = document.getElementById(HOST_ELEMENT_ID);
    if (host) host.setAttribute('data-mg-theme', theme);
    document.body.setAttribute('data-mg-theme', theme);
  }, [theme]);

  return (
    <MemoryGraph.Root
      storageKey="mg-ext:session"
      persistenceAdapter={adapter}
      route={pathname}
      site={window.location.origin}
      open={true}
    >
      {/* No <Zone> — Root falls back to document.body automatically.
       * No <Panel>/<Handle>/<Backdrop> — those live in the sidePanel.
       * No <Graph>/<Stats>/<Footer> — sidePanel is the view surface.
       * The lib's Root already sets `body[data-mg-linking]` during
       * linking mode via useLinkingModeEffects — nothing to bridge. */}
      <MemoryGraph.SelectionToolbar />
      <MemoryGraph.LinkReveal />
      <MemoryGraph.Tooltip />
      <MemoryGraph.PinToast />
    </MemoryGraph.Root>
  );
}

// Bootstrap once the DOM is parsed. Using `document_idle` in the
// manifest means `document.body` is already present ; this is just a
// safety net for edge cases (redirects, very slow hydration).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', install, { once: true });
} else {
  install();
}
