import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

import '@stitclaude/memory-graph/styles';
import '@stitclaude/memory-graph/themes/stit-claude';
import './styles/demo.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

document.documentElement.dataset['mgTheme'] = 'stit-claude';

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
