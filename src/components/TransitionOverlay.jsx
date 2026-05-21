import { useState } from 'react'

const css = `
  @keyframes pkm-flash {
    0%   { opacity: 0; }
    10%  { opacity: 1; }
    20%  { opacity: 0; }
    35%  { opacity: 1; }
    50%  { opacity: 0; }
    65%  { opacity: 1; }
    80%  { opacity: 0; }
    90%  { opacity: 1; }
    100% { opacity: 1; }
  }

  @keyframes pkm-circle {
    0%   { clip-path: circle(0% at 50% 50%); }
    100% { clip-path: circle(150% at 50% 50%); }
  }

  .pkm-flash-layer {
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 9999;
    animation: pkm-flash 1.4s steps(1, end) forwards;
    pointer-events: none;
  }

  .pkm-circle-layer {
    position: fixed;
    inset: 0;
    background: #000;
    z-index: 9999;
    clip-path: circle(0% at 50% 50%);
    animation: pkm-circle 1.45s cubic-bezier(0, 0, 0.15, 1) forwards;
    pointer-events: none;
  }
`

export default function TransitionOverlay({ isActive, withFlash, onDone }) {
  const [circleOnly, setCircleOnly] = useState(false)

  const phase = !isActive ? null : (withFlash && !circleOnly) ? 'flash' : 'circle'

  if (phase === null) return null

  return (
    <>
      <style>{css}</style>

      {phase === 'flash' && (
        <div
          className="pkm-flash-layer"
          onAnimationEnd={() => setCircleOnly(true)}
        />
      )}

      {phase === 'circle' && (
        <div
          className="pkm-circle-layer"
          onAnimationEnd={onDone}
        />
      )}
    </>
  )
}
