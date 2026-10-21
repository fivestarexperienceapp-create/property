import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './lib/install';
import { App } from './App';
import { registerServiceWorker } from './lib/pwa';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// The service worker is only registered in production builds so development never serves stale files.
if (import.meta.env.PROD) registerServiceWorker();
