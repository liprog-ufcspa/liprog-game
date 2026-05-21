import React from 'react'
import winScene from '../assets/scenes/win-scene.webp'

const COLORS = ['#f97316', '#a855f7', '#22d3ee', '#facc15', '#4ade80', '#f472b6', '#60a5fa', '#fb923c']
const COUNT = 120

const css = `
  @keyframes confetti-fall {
    0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateY(110vh) rotate(800deg); opacity: 0; }
  }

  @keyframes victory-title {
    0%   { transform: scale(0) rotate(-8deg); opacity: 0; }
    65%  { transform: scale(1.08) rotate(2deg); opacity: 1; }
    80%  { transform: scale(0.97) rotate(-1deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes victory-sub {
    0%   { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes victory-btn {
    0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
    50%       { box-shadow: 0 0 28px rgba(255,255,255,0.55); }
  }

  .victory-title {
    animation: victory-title 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
  }

  .victory-sub {
    animation: victory-sub 0.5s ease 0.7s both;
  }

  .victory-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: #fff;
    background: rgba(10,5,2,0.8);
    border: none;
    border-bottom: 2px solid rgba(255,255,255,0.3);
    padding: 14px 32px;
    cursor: pointer;
    outline: 1px solid rgba(255,255,255,0.25);
    outline-offset: -4px;
    animation: victory-sub 0.5s ease 1s both, victory-btn 2.2s ease 1.5s infinite;
    transition: filter 0.2s ease, transform 0.07s ease;
  }

  .victory-btn:hover  { filter: brightness(1.3); }
  .victory-btn:active { transform: translateY(3px); }
`

function rand(a, b) { return a + Math.random() * (b - a) }

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const PARTICLES = Array.from({ length: COUNT }, () => {
  const duration = rand(2.5, 5)
  return {
    left:         rand(0, 100),
    color:        COLORS[Math.floor(Math.random() * COLORS.length)],
    width:        rand(6, 14),
    height:       rand(8, 20),
    duration,
    delay:        -rand(0, duration), // negativo = já em progresso ao montar
    borderRadius: Math.random() > 0.4 ? '2px' : '50%',
  }
})

export default function VictoryScreen({ onRestart }) {

  return (
    <div className="fade-in" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style>{css}</style>

      <img src={winScene} alt="Victory"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* Confetti — delay negativo garante chuva imediata e contínua */}
      {!reducedMotion && PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0,
          left: `${p.left}%`,
          width: p.width, height: p.height,
          background: p.color, borderRadius: p.borderRadius,
          animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
          zIndex: 1,
        }} />
      ))}

      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem', padding: '2rem',
      }}>
        <h1 className="victory-title" style={{
          fontFamily: "'Climate Crisis', sans-serif",
          fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
          color: '#fff', margin: 0, lineHeight: 1.05, textAlign: 'center',
          textShadow: '0 0 40px rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.8)',
        }}>
          Parabéns!<br />Você venceu!
        </h1>

        <p className="victory-sub" style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center', maxWidth: '480px', margin: 0,
          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
        }}>
          Agora jogue os dardos para ganhar seu prêmio!
        </p>

        <button className="victory-btn" onClick={onRestart}>
          Jogar novamente
        </button>
      </div>
    </div>
  )
}
