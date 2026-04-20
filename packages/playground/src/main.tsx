import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

import '@myrkh/memory-graph/styles';
import '@myrkh/memory-graph/themes/stit-claude';

// Site shell (nav + footer + pages)
import './styles/site-base.css';
import './styles/site-brandmark.css';
import './styles/site-hero.css';
import './styles/site-promise.css';
import './styles/site-features.css';
import './styles/site-demo.css';
import './styles/site-docs.css';
import './styles/site-quickstart.css';
import './styles/site-api.css';
import './styles/site-philosophy.css';
import './styles/site-footer.css';
import './styles/site-motion.css';
import './styles/site-transitions.css';

// Demo essay typography (used inside the demo page)
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
