import { Howl, Howler } from 'howler'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE     = import.meta.env.BASE_URL
const BG_VOL   = 0.35  // volume normal da música de fundo
const DUCK_VOL = 0.07  // volume durante ducking (acerto)
const FADE_OUT = 300   // ms para fade-out nos eventos terminais (erro/vitória)
const DUCK_IN  = 150   // ms para abaixar volume no ducking
const DUCK_OUT = 400   // ms para restaurar volume após ducking

// ─── Background music ─────────────────────────────────────────────────────────
// Inicia somente após interação do usuário (política de autoplay dos browsers).
// O AudioContext é pré-desbloqueado no mousedown do botão via unlockAudio()
// para garantir play sem latência perceptível no click.

const bg = new Howl({
  src:   [`${BASE}audio/bg-music.mp3`],
  loop:  true,
  volume: BG_VOL,
  html5: true, // streaming — toca imediatamente sem esperar decode completo do MP3
  onloaderror: () => console.warn('[sound] bg-music.mp3 não encontrado em public/audio/'),
})

// ─── Sound effects ────────────────────────────────────────────────────────────

function makeSfx(file, volume) {
  return new Howl({
    src: [`${BASE}audio/${file}`],
    volume,
    onloaderror: () => {},
  })
}

const sfx = {
  correct:  makeSfx('sfx-correct.wav',  0.70),
  wrong:    makeSfx('sfx-wrong.wav',    0.75),
  timeout:  makeSfx('sfx-timeout.wav',  0.70),
  victory:  makeSfx('sfx-victory.wav',  0.80),
  gameover: makeSfx('sfx-gameover.wav', 0.75),
}

// ─── Ducking ──────────────────────────────────────────────────────────────────
// Usado apenas no acerto: abaixa a música enquanto o SFX toca e restaura depois.
// Nos eventos terminais (erro, vitória, timeout) a música é silenciada de vez.

let duckTimer = null

function duckAndPlay(howl, restoreAfterMs) {
  clearTimeout(duckTimer)
  bg.fade(bg.volume(), DUCK_VOL, DUCK_IN)
  howl.play()
  duckTimer = setTimeout(() => bg.fade(bg.volume(), BG_VOL, DUCK_OUT), restoreAfterMs)
}

function fadeOutBgAndPlay(howl) {
  clearTimeout(duckTimer)
  bg.fade(bg.volume(), 0, FADE_OUT)
  howl.play()
}

// ─── Exports públicos ─────────────────────────────────────────────────────────

// Desbloqueia o WebAudio antes do click (chame no mousedown do botão de início)
export function unlockAudio() {
  if (Howler.ctx?.state === 'suspended') Howler.ctx.resume()
}

export function startBg() {
  if (!bg.playing()) bg.play()
}

// Acerto: ducking temporário — música volta após o SFX
export function playCorrect()  { duckAndPlay(sfx.correct, 1600) }

// Erro / timeout: fade-out permanente da música
export function playWrong()    { fadeOutBgAndPlay(sfx.wrong) }
export function playTimeout()  { fadeOutBgAndPlay(sfx.timeout) }

// Vitória: fade-out permanente da música
export function playVictory()  { fadeOutBgAndPlay(sfx.victory) }

// Game over: bg já está silenciada neste ponto (veio de playWrong/playTimeout)
export function playGameover() { sfx.gameover.play() }

// Mute global — afeta música e SFX
export function setMuted(muted) { Howler.mute(muted) }
