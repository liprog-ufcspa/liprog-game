import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          width: '100vw', height: '100vh', background: '#0a0508',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem', padding: '2rem', textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.9rem', color: '#f87171', letterSpacing: '0.1em',
          }}>
            Erro inesperado
          </h2>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', maxWidth: '420px',
          }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.65rem', letterSpacing: '0.12em',
              background: 'transparent', border: '1px solid #f87171',
              color: '#f87171', padding: '12px 28px', cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
