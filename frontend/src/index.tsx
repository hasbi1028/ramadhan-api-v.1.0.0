/**
 * ═══════════════════════════════════════════════════════
 * React App Entry Point
 * ═══════════════════════════════════════════════════════
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found!');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🚀 App mounted!');
