import React from 'react'
import loseScene from '../assets/scenes/lose-scene.webp'

const css = `
  .gameover-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: #c8860a;
    background: rgba(10, 5, 2, 0.85);
    border: none;
    border-bottom: 2px solid rgba(120, 60, 0, 0.6);
    padding: 14px 32px;
    cursor: pointer;
    box-shadow: 0 5px 0 rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06);
    outline: 1px solid rgba(200, 134, 10, 0.35);
    outline-offset: -4px;
    transition: color 0.3s ease, box-shadow 0.3s ease, transform 0.07s ease;
  }
  .gameover-btn:hover {
    color: #f0a830;
    box-shadow: 0 5px 0 rgba(0,0,0,0.8), 0 0 18px rgba(200,134,10,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .gameover-btn:active { transform: translateY(4px); box-shadow: 0 1px 0 rgba(0,0,0,0.8); }

  .gameover-card {
    background: rgba(10,5,2,0.88);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .gameover-card { padding: 0.875rem; max-width: 100%; }
    .gameover-btn { font-size: 0.6rem; padding: 12px 20px; min-height: 48px; }
  }

  @media (max-width: 360px) {
    .gameover-card { padding: 0.75rem; }
    .gameover-btn { font-size: 0.55rem; }
  }
`

export default function GameOverScreen({ onRestart, result }) {
  return (
    <div className="fade-in" style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      <style>{css}</style>

      <img src={loseScene} alt="Game Over"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.82) 100%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(1rem, 3vh, 1.75rem)', padding: 'clamp(1rem, 3vw, 2rem)',
        overflowY: 'auto',
      }}>
        <h1 style={{
          fontFamily: "'Climate Crisis', sans-serif",
          fontSize: 'clamp(2rem, 7vw, 5rem)',
          color: '#8b1a1a', margin: 0, lineHeight: 1,
          textShadow: '0 0 40px rgba(180,20,20,0.5), 0 4px 16px rgba(0,0,0,0.9)',
        }}>
          Game Over
        </h1>

        {result && (
          <div className="gameover-card">
            <p style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Fase {result.phase} · {result.chosenIndex === -1 ? 'Tempo esgotado' : 'Resposta errada'}
            </p>

            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.9rem', color: '#e8d9bc', fontWeight: 600,
            }}>
              {result.question.text}
            </p>

            {result.question.code && (
              <pre style={{
                margin: 0, background: '#0d0804',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#c8a060', padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: 'clamp(0.7rem, 1.4vw, 0.88rem)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                overflowX: 'auto',
              }}>
                {result.question.code}
              </pre>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {result.question.options.map((opt, i) => {
                const isCorrect = Number(i) === Number(result.question.correctIndex)
                const isChosen  = Number(i) === Number(result.chosenIndex)
                return (
                  <div key={i} style={{
                    padding: '8px 12px', borderRadius: '5px',
                    fontSize: '0.85rem', fontFamily: "'Montserrat', sans-serif",
                    fontWeight: isCorrect ? 700 : 400,
                    background: isCorrect
                      ? 'rgba(20,83,45,0.7)'
                      : isChosen ? 'rgba(127,29,29,0.7)' : 'rgba(255,255,255,0.04)',
                    border: isCorrect
                      ? '1px solid rgba(74,222,128,0.5)'
                      : isChosen ? '1px solid rgba(248,113,113,0.5)' : '1px solid transparent',
                    color: isCorrect ? '#4ade80' : isChosen ? '#f87171' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{i + 1}.</span>
                    {opt}
                    {isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    {isChosen && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button className="gameover-btn" onClick={onRestart}>
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
