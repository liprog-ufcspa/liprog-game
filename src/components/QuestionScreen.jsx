import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import questionScene from '../assets/scenes/question-scene.webp'

const TIMERS = { easy: 30, medium: 45, hard: 60 }

function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const ANSWERS = [
  { color: '#5c2800', glow: '#c05010', shape: '⚔' },
  { color: '#0d2a52', glow: '#1a5aaa', shape: '✦' },
  { color: '#3a0e52', glow: '#7a28b8', shape: '☽' },
  { color: '#0e3d22', glow: '#1a7a44', shape: '❖' },
]

const KEY_MAP = { '1': 0, '2': 1, '3': 2, '4': 3 }


const css = `
  .dungeon-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 0 20px;
    height: 90px;
    border: 1px solid rgba(255,255,255,0.08);
    border-top: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: #d4c5a9;
    text-align: left;
    transition: filter 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 0 rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .dungeon-btn:not(:disabled):hover {
    filter: brightness(1.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.7), 0 0 20px var(--glow), inset 0 1px 0 rgba(255,255,255,0.1);
    color: #fff;
  }

  .dungeon-btn:not(:disabled):active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.6);
    filter: brightness(0.9);
  }

  .dungeon-btn:disabled { cursor: default; }

  .dungeon-shape {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: rgba(255,255,255,0.6);
  }

  .key-hint {
    margin-left: auto;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.25);
    font-family: 'Press Start 2P', cursive;
  }

  /* Layout geral da tela de pergunta */
  .q-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 2rem;
    gap: 1.25rem;
  }

  /* Card da pergunta */
  .q-card-wrap {
    position: relative;
    width: 100%;
    max-width: 960px;
  }

  /* Timer circular sobreposto ao card */
  .q-timer {
    position: absolute;
    top: -22px;
    right: -22px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.05rem;
  }

  /* Grid 2x2 das alternativas */
  .answers-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;
    max-width: 960px;
  }

  @media (max-width: 600px) {
    .q-layout { padding: 0.5rem; gap: 0.5rem; }
    .answers-grid { grid-template-columns: 1fr; gap: 6px; }
    .dungeon-btn { height: auto; min-height: 48px; padding: 10px 12px; font-size: 0.82rem; }
    .dungeon-shape { width: 28px; height: 28px; font-size: 0.8rem; }
    .key-hint { display: none; }
    .q-timer { top: -12px; right: 4px; width: 42px; height: 42px; font-size: 0.85rem; }
  }

  @media (max-width: 360px) {
    .dungeon-btn { font-size: 0.75rem; min-height: 44px; padding: 8px 10px; }
  }
`

export default function QuestionScreen({
  question, difficulty, onCorrect, onWrong,
  revealCorrect = false, chosenIndex = null,
}) {
  const timerStart = TIMERS[difficulty] ?? 60
  const [timeLeft, setTimeLeft] = useState(timerStart)
  const [answered, setAnswered] = useState(false)
  const [shaking, setShaking]   = useState(false)
  const shakeTimer = useRef(null)

  // Embaralha a ordem das opções para cada nova pergunta
  const shuffledIndices = useMemo(() => shuffleArray([0, 1, 2, 3]), [])

  useEffect(() => {
    return () => clearTimeout(shakeTimer.current)
  }, [])

  useEffect(() => {
    if (answered) return
    if (timeLeft === 0) { setAnswered(true); onWrong(-1); return }

    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, onWrong, answered])

  const handleAnswer = useCallback((displayIndex) => {
    if (answered || revealCorrect) return
    setAnswered(true)
    // Converte índice visual para índice original
    const originalIndex = shuffledIndices[displayIndex]
    const correct = originalIndex === Number(question.correctIndex)
    if (correct) {
      onCorrect()
    } else {
      setShaking(true)
      shakeTimer.current = setTimeout(() => {
        setShaking(false)
        onWrong(originalIndex)
      }, 450)
    }
  }, [answered, revealCorrect, question, onCorrect, onWrong, shuffledIndices])

  // Teclas 1–4
  useEffect(() => {
    function onKey(e) {
      if (e.key in KEY_MAP) {
        const displayIndex = KEY_MAP[e.key]
        handleAnswer(displayIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleAnswer])

  function getButtonOverride(displayIndex) {
    if (!revealCorrect) return {}
    const originalIndex = shuffledIndices[displayIndex]
    const isCorrect = originalIndex === Number(question.correctIndex)
    const isChosen  = originalIndex === Number(chosenIndex)
    if (isCorrect) return {
      background: '#14532d',
      border: '2px solid #4ade80',
      boxShadow: '0 0 18px rgba(74,222,128,0.4)',
      color: '#fff', filter: 'none',
    }
    if (isChosen && chosenIndex >= 0) return {
      background: '#7f1d1d',
      border: '2px solid #f87171',
      boxShadow: '0 0 18px rgba(248,113,113,0.4)',
      color: '#fff', filter: 'none',
    }
    return { opacity: 0.3, filter: 'none' }
  }

  const pct = (timeLeft / timerStart) * 100
  const timerGlow = timeLeft > timerStart * 0.66
    ? '#c8860a' : timeLeft > timerStart * 0.33
    ? '#c86a0a' : '#c82020'

  return (
    <div className={shaking ? 'shake' : ''} style={{ position: 'fixed', inset: 0 }}>
    <div className="fade-in" role="main" aria-label="Tela de pergunta" style={{
      width: '100%', height: '100dvh',
      position: 'relative',
      fontFamily: "'Montserrat', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{css}</style>

      <img src={questionScene} alt="" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 100%)',
      }} />

      {/* Timer bar */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '6px', background: 'rgba(0,0,0,0.6)' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: timerGlow,
          boxShadow: `0 0 8px ${timerGlow}`,
          transition: 'width 1s linear, background 0.5s ease, box-shadow 0.5s ease',
        }} />
      </div>

      <div className="q-layout" style={{ position: 'relative', zIndex: 1 }}>

        {/* Card da pergunta */}
        <div className="q-card-wrap">
          <div style={{
            background: '#1e1008',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '8px', padding: 'clamp(0.75rem, 3vw, 1.5rem) clamp(0.875rem, 4vw, 2rem)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)',
          }}>
            <h2 style={{
              margin: 0, fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)',
              fontWeight: 700, color: '#f5ecd4',
              textAlign: 'center', letterSpacing: '0.01em',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}>
              {question.text}
            </h2>

            {question.code && (
              <pre style={{
                margin: 0, background: '#0d0804',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#c8a060', padding: '0.9rem 1.2rem',
                borderRadius: '6px',
                fontSize: 'clamp(0.75rem, 1.6vw, 0.95rem)',
                width: '100%', overflowX: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {question.code}
              </pre>
            )}
          </div>

          {/* Timer circular — posição ajustada via .q-timer no CSS */}
          <div className="q-timer" style={{
            background: 'rgba(10,6,3,0.9)',
            border: `2px solid ${timerGlow}`,
            boxShadow: `0 0 12px ${timerGlow}55`,
            color: timerGlow,
            transition: 'border-color 0.5s, color 0.5s, box-shadow 0.5s',
          }}
            aria-live={timeLeft <= 10 ? 'assertive' : 'off'}
            aria-label={`${timeLeft} segundos restantes`}
          >
            {timeLeft}
          </div>
        </div>

        {/* Hint when timeout */}
        {revealCorrect && chosenIndex === -1 && (
          <p style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: '0.6rem', color: '#f87171',
            letterSpacing: '0.1em',
          }}>
            Tempo esgotado!
          </p>
        )}

        {/* Grid de alternativas — colapsa para 1 coluna no mobile via .answers-grid */}
        <div className="answers-grid">
          {shuffledIndices.map((originalIndex, displayIndex) => {
            const option = question.options[originalIndex]
            const isCorrect = originalIndex === Number(question.correctIndex)
            return (
              <button
                key={displayIndex}
                className="dungeon-btn"
                disabled={answered || revealCorrect}
                aria-label={`Opção ${displayIndex + 1}: ${option}${isCorrect && revealCorrect ? ' — resposta correta' : ''}`}
                style={{
                  background: ANSWERS[displayIndex].color,
                  '--glow': ANSWERS[displayIndex].glow,
                  transition: 'all 0.4s ease',
                  ...getButtonOverride(displayIndex),
                }}
                onClick={() => handleAnswer(displayIndex)}
              >
                <span className="dungeon-shape" aria-hidden="true">{ANSWERS[displayIndex].shape}</span>
                <span style={{ flex: 1 }}>{option}</span>
                {!revealCorrect && (
                  <span className="key-hint" aria-hidden="true">[{displayIndex + 1}]</span>
                )}
              </button>
            )
          })}
        </div>

      </div>
    </div>
    </div>
  )
}
