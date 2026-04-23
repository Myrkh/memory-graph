# @myrkh/memory-graph-extension

Chrome extension wrapping the `@myrkh/memory-graph` library into an ambient, cross-site reading-attention tracker. Uses the [Chrome sidePanel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) (Chrome 114+) so the full UI — Typewriter tabs, graph, constellation view, theme shop — lives in the browser's side panel rather than injected into each page.

## Architecture

```
content script   →   service worker   →   side panel
(DOM tracking)       (unified state)       (React UI)
```

- **Content script** (`src/content/content.ts`) — injected on every page, observes reading attention, forwards commit events to the background worker. Zero UI inside the host page.
- **Service worker** (`src/background/service-worker.ts`) — non-persistent MV3 worker. Owns the unified `chrome.storage.local` super-state, broadcasts updates, hosts the theme license gate.
- **Side panel** (`src/sidepanel/`) — a React app rendered in `chrome.sidePanel`. The full UI surface. Imports `@myrkh/memory-graph` for the graph engine and styles.

## Dev flow

```bash
# From the repo root — installs the workspace including this package
pnpm install

# Build the icons (SVG → PNG 48/128) + the extension bundle
pnpm --filter @myrkh/memory-graph-extension build

# Alternative: watch mode for dev
pnpm --filter @myrkh/memory-graph-extension dev
```

Then in Chrome (114+) :
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** → select `packages/extension/dist/`
4. Pin the extension to the toolbar (jigsaw icon → pin)
5. Click the icon on any website → the side panel opens

## Files

| Path | Role |
|---|---|
| `public/manifest.json` | MV3 manifest declaration |
| `public/icon.svg` | Brand mark source (generated to PNG 48/128 via `scripts/build-icons.mjs`) |
| `src/background/service-worker.ts` | Non-persistent worker, owns state + license gate |
| `src/content/content.ts` | Content script injected on all URLs |
| `src/sidepanel/sidepanel.html` | Side panel HTML entry |
| `src/sidepanel/sidepanel.tsx` | React bootstrap, imports lib + theme |
| `src/sidepanel/SidePanelApp.tsx` | Root React component |
| `src/sidepanel/sidepanel.css` | Structural + Stit'Claude grammar styles |
| `scripts/build-icons.mjs` | SVG → PNG rasterizer (resvg-js, pure JS) |
| `vite.config.ts` | Multi-entry build (panel + worker + content) |

## Roadmap (v0.3.0)

Staged in `/V0.3.0-BRIEF.md` at the repo root. Current status: **skeleton only** — the wiring boots, messages round-trip between worker / content / panel, but no feature code yet.

Next:
1. Storage adapter (`chrome.storage.local` ↔ `SerializedGraph`)
2. Typewriter tabs primitive
3. Constellation view primitive
4. Theme shop modal + 2 premium themes (cyberpunk + ma)
5. OKLCH palette editor
6. License gate (Lemon Squeezy purchase flow)

## Permissions rationale

| Permission | Why |
|---|---|
| `sidePanel` | Host the UI in the browser's side panel |
| `storage` | Persist unified state via `chrome.storage.local` |
| `tabs` | Read active tab origin/URL for `route` / `site` tagging |
| `host_permissions: <all_urls>` | Let the content script run on any website the user visits |

Zero analytics, zero network, zero telemetry. The lib already guarantees this; the extension inherits it.
