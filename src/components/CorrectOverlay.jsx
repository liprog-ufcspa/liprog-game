import React from 'react'

const COLORS = ['#f97316', '#a855f7', '#22d3ee', '#facc15', '#4ade80', '#f472b6', '#60a5fa']
const COUNT = 70

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

const PARTICLES = Array.from({ length: COUNT }, (_, i) => ({
  id: i,
  left: randomBetween(0, 100),
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  width: randomBetween(6, 13),
  height: randomBetween(8, 18),
  duration: randomBetween(0.9, 1.8),
  delay: randomBetween(0, 0.4),
  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
}))

const css = `
  @keyframes shoot-up {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    70%  { opacity: 1; }
    100% { transform: translateY(-105vh) rotate(600deg); opacity: 0; }
  }

  @keyframes correct-pop {
    0%   { transform: scale(0.4); opacity: 0; }
    60%  { transform: scale(1.15); opacity: 1; }
    80%  { transform: scale(0.95); }
    100% { transform: scale(1); opacity: 1; }
  }

  .correct-label {
    animation: correct-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
`

export default function CorrectOverlay() {

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <style>{css}</style>

      {/* Confetti particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.borderRadius,
            animation: `shoot-up ${p.duration}s ${p.delay}s cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
          }}
        />
      ))}

      {/* Label */}
      <div className="correct-label" style={{
        fontFamily: "'Climate Crisis', sans-serif",
        fontSize: 'clamp(2rem, 8vw, 5rem)',
        color: '#4ade80',
        textShadow: '0 0 40px rgba(74,222,128,0.6), 0 4px 16px rgba(0,0,0,0.9)',
        letterSpacing: '0.04em',
        userSelect: 'none',
      }}>
        Correto!
      </div>
    </div>
  )
}
