import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

import '@myrkh/memory-graph/styles';
import '@myrkh/memory-graph/themes/stit-claude';
import './styles/demo.css';
import './styles/demo-essay.css';
import './styles/demo-essay-elements.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

document.documentElement.dataset['mgTheme'] = 'stit-claude';

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
