import React from 'react';

// Catches render errors anywhere in the tree so a single component crash shows
// a recoverable fallback instead of unmounting the whole app to a blank screen.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a1a', color: '#e0e0e0', fontFamily: 'monospace', padding: 24,
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h1 style={{ color: '#00d4ff', fontSize: 20, marginBottom: 8 }}>Something glitched</h1>
            <p style={{ color: '#8a8a9a', fontSize: 14, marginBottom: 16 }}>
              The app hit an unexpected error. Try reloading.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid #00d4ff44',
                background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: '#fff',
                cursor: 'pointer', fontWeight: 'bold',
              }}
            >
              Reload
            </button>
            <pre style={{
              marginTop: 16, fontSize: 11, color: '#ef4444', whiteSpace: 'pre-wrap', textAlign: 'left',
            }}>{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
