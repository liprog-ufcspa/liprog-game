import { useState, useMemo } from 'react'

const BASE    = import.meta.env.BASE_URL
const ORIGIN  = window.location.origin
const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/'

const GAMES = [
  { id: 'smb',   title: 'Super Mario Bros.',       core: 'nestopia', file: 'easteregg/smb.nes',       cover: 'easteregg/covers/smb.jpg'   },
  { id: 'fzero', title: 'F-Zero',                  core: 'snes9x',   file: 'easteregg/fzero.zip',     cover: 'easteregg/covers/fzero.jpg' },
  { id: 'sf2',   title: 'Street Fighter II Turbo', core: 'snes9x',   file: 'easteregg/sf2turbo.zip',  cover: 'easteregg/covers/sf2.jpg'   },
  { id: 'smw',   title: 'Super Mario World',        core: 'snes9x',   file: 'easteregg/smw.sfc',       cover: 'easteregg/covers/smw.jpg'   },
  { id: 'zelda', title: 'Zelda: A Link to the Past',core: 'snes9x',   file: 'easteregg/zelda.zip',     cover: 'easteregg/covers/zelda.jpg' },
  { id: 'dkc',     title: 'Donkey Kong Country',    core: 'snes9x',   file: 'easteregg/dkc.sfc',       cover: 'easteregg/covers/dkc.jpg'     },
  { id: 'contra3', title: 'Contra III',             core: 'snes9x',   file: 'easteregg/contra3.zip',   cover: 'easteregg/covers/contra3.jpg' },
  { id: 'mmx',     title: 'Mega Man X',             core: 'snes9x',   file: 'easteregg/mmx.zip',       cover: 'easteregg/covers/mmx.jpg'     },
  { id: 'tetris',  title: 'Tetris',                 core: 'nestopia', file: 'easteregg/tetris.zip',    cover: 'easteregg/covers/tetris.jpg'  },
]

function buildDoc(romUrl, core) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;overflow:hidden;touch-action:none}
    #game{width:100vw;height:100vh}
  </style>
</head>
<body>
  <div id="game"></div>
  <script>
    EJS_player         = '#game';
    EJS_core           = '${core}';
    EJS_gameUrl        = '${romUrl}';
    EJS_pathtodata     = '${EJS_CDN}';
    EJS_startOnLoaded  = true;
    EJS_VirtualGamepad = true;
  </script>
  <script src="${EJS_CDN}loader.js"></script>
</body>
</html>`
}

// ─── Grid de seleção (3 colunas) ──────────────────────────────────────────────
function GameGrid({ onSelect, onClose }) {
  return (
    <div style={s.overlay}>
      <style>{`
        .ee-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.6rem; width:100%; max-width:520px; }
        @media(max-width:400px){ .ee-grid{ grid-template-columns:repeat(2,1fr); max-width:320px; } }
        .ee-card:hover { opacity:0.82; }
      `}</style>

      <button onClick={onClose} aria-label="Fechar" style={s.closeBtn}>✕</button>

      <p style={s.label}>Você encontrou um segredo</p>

      <div className="ee-grid">
        {GAMES.map(game => (
          <button key={game.id} onClick={() => onSelect(game)} className="ee-card" style={s.card}>
            <img
              src={`${BASE}${game.cover}`}
              alt={game.title}
              style={s.cover}
            />
            <span style={s.cardTitle}>{game.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Tela do jogo ─────────────────────────────────────────────────────────────
function GameView({ game, onBack, onClose }) {
  const doc = useMemo(
    () => buildDoc(`${ORIGIN}${BASE}${game.file}`, game.core),
    [game]
  )

  return (
    <div style={{ ...s.overlay, padding: 0, justifyContent: 'flex-start' }}>
      <div style={s.topBar}>
        <button onClick={onBack}  style={s.navBtn}>← Jogos</button>
        <span style={s.gameTitle}>{game.title}</span>
        <button onClick={onClose} style={s.navBtn}>✕</button>
      </div>
      <iframe
        key={game.id}
        srcDoc={doc}
        title={game.title}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
        style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
      />
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.97)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '1rem', padding: '1rem',
  },
  closeBtn: {
    position: 'absolute', top: '0.75rem', right: '0.75rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', borderRadius: 4, padding: '0.35rem 0.65rem',
    cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'monospace',
    minWidth: 36, minHeight: 36,
  },
  label: {
    color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem',
    fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase',
  },
  card: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 5, cursor: 'pointer', padding: 0, overflow: 'hidden',
    transition: 'opacity 0.15s', display: 'flex', flexDirection: 'column',
  },
  cover: {
    width: '100%', aspectRatio: '4/3', objectFit: 'cover',
    borderRadius: '3px 3px 0 0', display: 'block',
  },
  cardTitle: {
    fontFamily: 'monospace', fontSize: 'clamp(0.5rem, 1.4vw, 0.65rem)',
    color: 'rgba(255,255,255,0.7)', textAlign: 'center',
    lineHeight: 1.3, padding: '0.3rem 0.25rem', display: 'block',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.35rem 0.6rem', background: 'rgba(0,0,0,0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    flexShrink: 0, gap: '0.5rem', minHeight: 40, width: '100%',
  },
  navBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.55)', borderRadius: 4,
    padding: '0.25rem 0.55rem', cursor: 'pointer',
    fontSize: '0.65rem', fontFamily: 'monospace',
    minWidth: 44, minHeight: 32, flexShrink: 0,
  },
  gameTitle: {
    color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace',
    fontSize: '0.6rem', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EasterEgg({ x = '12%', y = '48%' }) {
  const [open,         setOpen]        = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)

  function close() {
    setSelectedGame(null)
    setOpen(false)
  }

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute', left: x, top: y, zIndex: 10,
          cursor: 'pointer', lineHeight: 0,
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 4px rgba(192,132,252,0.45))',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pg" cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#7c3aed" />
              <stop offset="55%"  stopColor="#3b1a6e" />
              <stop offset="100%" stopColor="#0d0b1f" />
            </radialGradient>
            <radialGradient id="ph" cx="32%" cy="28%" r="45%">
              <stop offset="0%"   stopColor="#e9d5ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0"   />
            </radialGradient>
          </defs>
          {/* Anel atrás */}
          <ellipse cx="9" cy="10" rx="8.5" ry="2.2" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.35" />
          {/* Corpo */}
          <circle cx="9" cy="9" r="5.5" fill="url(#pg)" />
          {/* Faixas de superfície */}
          <ellipse cx="9" cy="8.2" rx="4.2" ry="0.9" fill="#c084fc" opacity="0.18" />
          <ellipse cx="9" cy="10"  rx="3.5" ry="0.7" fill="#a855f7" opacity="0.15" />
          {/* Brilho */}
          <circle cx="9" cy="9" r="5.5" fill="url(#ph)" />
          {/* Anel frente */}
          <path d="M 0.5 10 Q 9 7.2 17.5 10" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.9" />
        </svg>
      </div>

      {open && !selectedGame && <GameGrid onSelect={setSelectedGame} onClose={close} />}
      {open &&  selectedGame && <GameView game={selectedGame} onBack={() => setSelectedGame(null)} onClose={close} />}
    </>
  )
}
