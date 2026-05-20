import React, { useMemo } from 'react'

// Técnica do GeeksforGeeks: 3 animações com durações diferentes por vagalume
// criam trajetórias orgânicas únicas sem keyframes por partícula

const css = `
  @keyframes ff-x {
    0%, 100% { left: 80%; }
    16%       { left: 94%; }
    33%       { left: 10%; }
    50%       { left: 58%; }
    66%       { left: 72%; }
    83%       { left: 4%;  }
  }
  @keyframes ff-y {
    0%, 100% { top: 8%;  }
    25%      { top: 88%; }
    50%      { top: 42%; }
    75%      { top: 78%; }
  }
  @keyframes ff-glow {
    0%, 100% {
      box-shadow: 0 0 4px 2px rgba(255,220,50,0.85),
                  0 0 14px 6px rgba(255,190,0,0.45),
                  0 0 28px 10px rgba(255,170,0,0.2);
      opacity: 0.85; width: 4px; height: 4px;
    }
    45% {
      box-shadow: 0 0 6px 3px rgba(255,235,80,1),
                  0 0 22px 10px rgba(255,200,0,0.65),
                  0 0 40px 18px rgba(255,170,0,0.3);
      opacity: 1; width: 5px; height: 5px;
    }
    75% {
      box-shadow: none;
      opacity: 0.04; width: 2px; height: 2px;
    }
  }
`

function rand(a, b) { return a + Math.random() * (b - a) }

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Fireflies({ count = 16, zIndex = 2 }) {
  if (reducedMotion) return null

  const flies = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      xDur:      rand(90, 150),
      yDur:      rand(18, 35),
      glowDur:   rand(4,  8),
      xDelay:   -rand(0,  150),
      yDelay:   -rand(0,  35),
      glowDelay:-rand(0,  8),
    }))
  , [count])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', overflow: 'hidden',
      zIndex,
    }}>
      <style>{css}</style>
      {flies.map(f => (
        <div
          key={f.id}
          style={{
            position: 'absolute',
            width: 4, height: 4,
            borderRadius: '50%',
            background: 'rgb(255,220,50)',
            animation: [
              `ff-x ${f.xDur}s ${f.xDelay}s infinite cubic-bezier(0.39,0,0.63,1)`,
              `ff-y ${f.yDur}s ${f.yDelay}s infinite cubic-bezier(0.39,0,0.63,1)`,
              `ff-glow ${f.glowDur}s ${f.glowDelay}s infinite ease-in-out`,
            ].join(', '),
          }}
        />
      ))}
    </div>
  )
}
