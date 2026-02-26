/**
 * ═══════════════════════════════════════════════════════
 * React App Entry Point
 * ═══════════════════════════════════════════════════════
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[UI][FATAL] React render crashed', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', padding: '24px', background: '#fff' }}>
          <h1 style={{ fontFamily: 'sans-serif', marginBottom: '8px' }}>Aplikasi gagal dimuat</h1>
          <p style={{ fontFamily: 'sans-serif', marginBottom: '12px' }}>
            Buka console browser untuk melihat error detail.
          </p>
          <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {this.state.message || 'Unknown error'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  console.error('[UI][window.error]', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UI][unhandledrejection]', event.reason);
});

const container = document.getElementById('root');
if (process.env.NODE_ENV !== 'production') {
  console.log('[UI] boot start', {
    hasRoot: !!container,
    path: window.location.pathname,
    href: window.location.href,
  });
}

if (!container) {
  throw new Error('Root element not found!');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if (process.env.NODE_ENV !== 'production') {
  console.log('[UI] App mounted');
}
