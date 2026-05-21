import React, { useState } from 'react'
import TwoPathScene from '../assets/scenes/two-path-scene.webp'
import ThreePathScene from '../assets/scenes/three-path-scene.webp'
import ThreePathScene2 from '../assets/scenes/three-path-scene-2.webp'
import scenes from '../data/scenes.json'
import Fireflies from './Fireflies.jsx'

const VIEWBOX_W = 1920
const VIEWBOX_H = 1080

const FOG_COLORS = ['#7c3aed', '#0e7490', '#92400e']

const css = `
  @keyframes kb-scene {
    0%   { transform: scale(1.0) translate(0px, 0px); }
    50%  { transform: scale(1.03) translate(5px, -3px); }
    100% { transform: scale(1.05) translate(-4px, 4px); }
  }

  @keyframes scene-vignette {
    0%, 100% { box-shadow: inset 0 0 120px rgba(0,0,0,0.55); }
    50%       { box-shadow: inset 0 0 160px rgba(0,0,0,0.75); }
  }

  .scene-kb-wrap {
    position: absolute; inset: 0;
    transform-origin: center;
    animation: kb-scene 24s ease-in-out infinite alternate;
  }

  .scene-kb-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }

  .scene-vignette {
    position: absolute; inset: 0; pointer-events: none; z-index: 2;
    animation: scene-vignette 6s ease-in-out infinite;
  }

  .scene-label {
    font-family: 'Press Start 2P', cursive;
    font-size: 1rem;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.85);
    text-shadow: 0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7);
    border-bottom: 2px solid rgba(160, 100, 220, 0.35);
    padding-bottom: 8px;
    pointer-events: none;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .scene-label { font-size: 0.65rem; letter-spacing: 0.05em; padding-bottom: 6px; }
  }

`

const images = {
  'three-path': ThreePathScene,
  'three-path-2': ThreePathScene2,
  'two-path': TwoPathScene,
}

export default function SceneScreen({ sceneIndex, onChoosePath }) {
  const [hovered, setHovered] = useState(null)
  const scene = scenes[sceneIndex]
  const background = images[scene.image]

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <style>{css}</style>

      {/* Imagem e SVG no mesmo wrapper para o ken-burns mover os dois juntos */}
      <div className="scene-kb-wrap">
        <img src={background} alt="Scene" className="scene-kb-img" />
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
        <defs>
          {scene.paths.map((path, i) => (
            <radialGradient key={i} id={`fog-${sceneIndex}-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={FOG_COLORS[i]} stopOpacity="0.75" />
              <stop offset="45%"  stopColor={FOG_COLORS[i]} stopOpacity="0.35" />
              <stop offset="100%" stopColor={FOG_COLORS[i]} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {scene.paths.map((path, i) => (
          <g key={i}>
            {/* Fog circle */}
            <circle
              cx={path.cx}
              cy={path.cy}
              r={path.r}
              fill={`url(#fog-${sceneIndex}-${i})`}
              style={{
                opacity: hovered === i ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
              }}
            />

            {/* Hit area — clicável, touch e teclado */}
            <circle
              cx={path.cx}
              cy={path.cy}
              r={path.r}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={`Escolher caminho ${i + 1}`}
              style={{ cursor: 'pointer', touchAction: 'none' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChoosePath(i)}
              onTouchStart={(e) => { e.preventDefault(); setHovered(i); }}
              onTouchEnd={(e) => { e.preventDefault(); setHovered(null); onChoosePath(i); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault(); onChoosePath(i);
                }
              }}
            />

          </g>
        ))}
      </svg>
      </div>

      {/* Vinheta e vagalumes fora do wrapper para não sofrerem o ken-burns */}
      <div className="scene-vignette" />
      <Fireflies count={14} zIndex={3} />

      {/* Indicador de fase */}
      <div style={{
        position: 'absolute', top: 'clamp(0.6rem, 2vh, 1.25rem)', left: '50%',
        transform: 'translateX(-50%)', zIndex: 4,
        display: 'flex', gap: 'clamp(5px, 1.5vw, 8px)', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 'clamp(7px, 2vw, 10px)', height: 'clamp(7px, 2vw, 10px)', borderRadius: '50%',
            background: i <= sceneIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
            boxShadow: i <= sceneIndex ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', top: 'clamp(0.5rem, 2vh, 1rem)', right: 'clamp(0.75rem, 2vw, 1.5rem)', zIndex: 4,
        fontFamily: "'Press Start 2P', cursive",
        fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.08em', textShadow: '0 2px 8px rgba(0,0,0,0.8)',
      }}>
        Fase {sceneIndex + 1}/3
      </div>

      <div style={{
        position: 'absolute', bottom: '6%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 4,
      }}>
        <span className="scene-label">Escolha um caminho</span>
      </div>
    </div>
  )
}
