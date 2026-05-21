import React from 'react'

const css = `
  @keyframes loading-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .loading-dots {
    animation: loading-pulse 1.4s ease-in-out infinite;
  }
`

export default function LoadingScreen({ error }) {
  return (
    <div style={{
      width: '100%', height: '100dvh',
      background: '#0a0508',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1rem',
    }}>
      <style>{css}</style>

      <p style={{
        fontFamily: "'Press Start 2P', cursive",
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: error ? '#f87171' : '#c8860a',
        letterSpacing: '0.1em',
        textAlign: 'center',
        padding: '0 1rem',
      }}>
        {error ? 'Erro ao carregar' : (
          <span className="loading-dots">Carregando...</span>
        )}
      </p>

      {error && (
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
