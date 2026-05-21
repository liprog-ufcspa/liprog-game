import React from 'react'
import enterScene from '../assets/scenes/enter-scene.webp'
import liprogLogo from '../assets/liprog-logo.png'
import ufcspaAcolheLogo from '../assets/ufcspa-acolhe-logo.png'
import Fireflies from './Fireflies.jsx'

const styles = `
  @keyframes kb-drift {
    0%   { transform: scale(1.0) translate(0px, 0px); }
    50%  { transform: scale(1.03) translate(-6px, 4px); }
    100% { transform: scale(1.05) translate(7px, -3px); }
  }

  @keyframes vignette-breathe {
    0%, 100% { box-shadow: inset 0 0 100px rgba(0,0,0,0.45); }
    50%       { box-shadow: inset 0 0 140px rgba(0,0,0,0.68); }
  }

  .kb-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transform-origin: center;
    animation: kb-drift 28s ease-in-out infinite alternate;
  }

  .vignette {
    position: absolute; inset: 0; pointer-events: none;
    animation: vignette-breathe 5s ease-in-out infinite;
  }

  .play-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    color: #fff;
    background: #1a1a2e;
    border: none;
    border-bottom: 2px solid rgba(160, 100, 220, 0.45);
    padding: 16px 36px;
    cursor: pointer;
    image-rendering: pixelated;
    box-shadow:
      0 6px 0 #000,
      0 8px 32px rgba(0,0,0,0.85),
      0 16px 48px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.15);
    transform: translateY(0);
    transition: color 0.35s ease, box-shadow 0.35s ease, transform 0.07s ease;
    outline: 3px solid #fff;
    outline-offset: -6px;
  }

  .play-btn:hover {
    color: #c084fc;
    box-shadow:
      0 6px 0 #000,
      0 8px 32px rgba(0,0,0,0.85),
      0 0 22px rgba(160, 100, 220, 0.28),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .play-btn:active {
    transform: translateY(5px);
    box-shadow:
      0 1px 0 #000,
      inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .logo-ufcspa { height: 120px; }
  .logo-liprog  { height: 200px; }

  @media (max-width: 600px) {
    .logo-ufcspa { height: 64px; }
    .logo-liprog  { height: 100px; }
    .play-btn { font-size: 0.7rem; padding: 14px 24px; }
  }
`

const IntroScreen = ({ onStart }) => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style>{styles}</style>
      <img src={enterScene} alt="Intro" className="kb-img" />
      <div className="vignette" />

      <Fireflies count={12} />

      {/* Title — top */}
      <div style={{
        position: 'absolute', top: '8%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <h1 style={{
          fontFamily: "'Climate Crisis', sans-serif",
          fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
          color: '#fff',
          textShadow: '0 2px 4px #000, 0 6px 20px rgba(0,0,0,0.9), 0 12px 48px rgba(0,0,0,0.7)',
          margin: 0,
          lineHeight: 1.05,
          textAlign: 'center',
          letterSpacing: '0.02em'
        }}>
          Bug &amp;<br />Dispare
        </h1>
      </div>

      {/* Play button — lower */}
      <div style={{
        position: 'absolute', bottom: '22%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center'
      }}>
        <button
          className="play-btn"
          onClick={onStart}
        >
          Clique pra começar
        </button>
      </div>

      <img
        src={ufcspaAcolheLogo}
        alt="UFCSPA Acolhe"
        className="logo-ufcspa"
        style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', objectFit: 'contain' }}
      />

      <img
        src={liprogLogo}
        alt="LiProg"
        className="logo-liprog"
        style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', objectFit: 'contain' }}
      />
    </div>
  )
}

export default IntroScreen
