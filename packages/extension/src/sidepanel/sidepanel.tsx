import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SidePanelApp } from './SidePanelApp.js';

import '@myrkh/memory-graph/styles';
// All 6 themes are injected eagerly — each is scoped to
// `[data-mg-theme="<id>"]` so none of them leak when inactive, and the
// live theme can switch just by flipping the attribute on
// `<div data-mg-theme={theme}>` (see SidePanelApp). Fonts fetched via
// `@import` are deduplicated by the browser across sheets.
import '@myrkh/memory-graph/themes/stit-claude';
import '@myrkh/memory-graph/themes/plex';
import '@myrkh/memory-graph/themes/solaris';
import '@myrkh/memory-graph/themes/obsidian';
import '@myrkh/memory-graph/themes/kyoto';
import '@myrkh/memory-graph/themes/arcade';
import './sidepanel.css';
import './drawer.css';
import './shop.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found in sidepanel.html');

createRoot(root).render(
  <StrictMode>
    <SidePanelApp />
  </StrictMode>,
);
