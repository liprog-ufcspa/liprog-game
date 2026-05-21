// Estados possíveis do jogo
export const INTRO        = 'intro';
export const SCENE        = 'scene';
export const QUESTION     = 'question';
export const CORRECT      = 'correct';
export const WRONG_REVEAL = 'wrong_reveal';
export const GAMEOVER     = 'gameover';
export const VICTORY      = 'victory';

// Progressão garantida por fase — caminhos embaralhados para variar entre sessões
const SCENE_DIFFICULTIES = [
  ['easy', 'easy', 'medium'], // fase 1 — nunca começa difícil
  ['easy', 'medium', 'hard'], // fase 2 — progressão completa
  ['medium', 'hard'],         // fase 3 — nunca termina fácil
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function initSession(questionsData) {
  const pool = {
    easy:   shuffle(questionsData.easy),
    medium: shuffle(questionsData.medium),
    hard:   shuffle(questionsData.hard),
  };
  const counters = { easy: 0, medium: 0, hard: 0 };

  const pick = diff => ({
    difficulty: diff,
    question:   pool[diff][counters[diff]++],
  });

  return {
    scenes: SCENE_DIFFICULTIES.map(diffs => ({
      paths: shuffle(diffs).map(pick),
    })),
  };
}
