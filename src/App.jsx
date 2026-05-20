import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap'; // eslint-disable-line no-unused-vars
import './styles/global.css';
import IntroScreen    from './components/IntroScreen.jsx';
import SceneScreen    from './components/SceneScreen.jsx';
import QuestionScreen from './components/QuestionScreen.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import VictoryScreen  from './components/VictoryScreen.jsx';
import LoadingScreen  from './components/LoadingScreen.jsx';
import TransitionOverlay from './components/TransitionOverlay.jsx';
import CorrectOverlay    from './components/CorrectOverlay.jsx';
import { fetchQuestions } from './utils/fetchQuestions.js';

// Preload assets
import enterSceneImg   from './assets/scenes/enter-scene.png';
import threePathImg    from './assets/scenes/three-path-scene.png';
import twoPathImg      from './assets/scenes/two-path-scene.png';
import winSceneImg     from './assets/scenes/win-scene.png';
import loseSceneImg    from './assets/scenes/lose-scene.png';

const PRELOAD_IMGS = [enterSceneImg, threePathImg, twoPathImg, winSceneImg, loseSceneImg];

const INTRO        = 'intro';
const SCENE        = 'scene';
const QUESTION     = 'question';
const CORRECT      = 'correct';
const WRONG_REVEAL = 'wrong_reveal';
const GAMEOVER     = 'gameover';
const VICTORY      = 'victory';

const DIFFICULTY_LABEL = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pools de distribuição de dificuldade por cena com pesos
// Cenas 0 e 1: sempre inclui pelo menos 1 fácil e 1 difícil, mas varia o meio
// Cena 2: variação entre médias e combinação easy/hard
const SCENE_POOLS_A = [
  { diffs: ['easy', 'easy', 'hard'],   weight: 4 },
  { diffs: ['easy', 'medium', 'hard'], weight: 3 },
  { diffs: ['easy', 'easy', 'medium'], weight: 2 },
  { diffs: ['medium', 'hard', 'hard'], weight: 1 },
];
const SCENE_POOLS_B = [
  { diffs: ['medium', 'medium'], weight: 4 },
  { diffs: ['easy', 'hard'],     weight: 3 },
  { diffs: ['medium', 'hard'],   weight: 2 },
];

function pickPool(pools) {
  const total = pools.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pools) { r -= p.weight; if (r <= 0) return p.diffs; }
  return pools[0].diffs;
}

function initSession(questionsData) {
  const easy   = shuffle(questionsData.easy);
  const medium = shuffle(questionsData.medium);
  const hard   = shuffle(questionsData.hard);
  let ei = 0, mi = 0, hi = 0;
  const pick = diff => {
    if (diff === 'easy')   return { difficulty: 'easy',   question: easy[ei++]   };
    if (diff === 'medium') return { difficulty: 'medium', question: medium[mi++] };
    return                        { difficulty: 'hard',   question: hard[hi++]   };
  };
  return {
    scenes: [
      { paths: shuffle(pickPool(SCENE_POOLS_A)).map(pick) },
      { paths: shuffle(pickPool(SCENE_POOLS_A)).map(pick) },
      { paths: shuffle(pickPool(SCENE_POOLS_B)).map(pick) },
    ],
  };
}

export default function App() {
  const [questionsData,   setQuestionsData]   = useState(null);
  const [loadError,       setLoadError]       = useState(null);
  const [gameState,       setGameState]       = useState(INTRO);
  const [sceneIndex,      setSceneIndex]      = useState(0);
  const [session,         setSession]         = useState(null);
  const [currentPathData, setCurrentPathData] = useState(null);
  const [transitioning,   setTransitioning]   = useState(false);
  const [wrongChoice,     setWrongChoice]     = useState(null);
  const [lastResult,      setLastResult]      = useState(null);
  const [answerHistory,   setAnswerHistory]   = useState([]);

  const pendingAction      = useRef(null);
  const isFirstTransition  = useRef(true);
  const correctTimer       = useRef(null);
  const wrongRevealTimer   = useRef(null);

  // Fetch questions
  useEffect(() => {
    fetchQuestions()
      .then(data => setQuestionsData(data))
      .catch(err => setLoadError(err.message));
  }, []);

  // Preload images
  useEffect(() => {
    PRELOAD_IMGS.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  function goTo(action) {
    if (transitioning) return;
    pendingAction.current = action;
    setTransitioning(true);
  }

  function handleTransitionDone() {
    pendingAction.current?.();
    pendingAction.current    = null;
    isFirstTransition.current = false;
    setTransitioning(false);
  }

  function handleStart() {
    isFirstTransition.current = true;
    try { document.documentElement.requestFullscreen?.(); } catch (_) {}
    const newSession = initSession(questionsData);
    setSession(newSession);
    setSceneIndex(0);
    setAnswerHistory([]);
    goTo(() => setGameState(SCENE));
  }

  function handleChoosePath(pathIndex) {
    const pathData = session.scenes[sceneIndex].paths[pathIndex];
    setCurrentPathData(pathData);
    goTo(() => setGameState(QUESTION));
  }

  function handleCorrect() {
    setAnswerHistory(prev => [...prev, {
      phase: sceneIndex + 1,
      difficulty: currentPathData.difficulty,
      label: DIFFICULTY_LABEL[currentPathData.difficulty],
    }]);

    const action = sceneIndex === 2
      ? () => setGameState(VICTORY)
      : () => { setSceneIndex(sceneIndex + 1); setGameState(SCENE); };

    setGameState(CORRECT);
    correctTimer.current = setTimeout(() => goTo(action), 1800);
  }

  function handleWrong(chosenIndex = -1) {
    setLastResult({
      question:    currentPathData.question,
      chosenIndex,
      phase:       sceneIndex + 1,
    });
    setWrongChoice(chosenIndex);
    setGameState(WRONG_REVEAL);
    wrongRevealTimer.current = setTimeout(() => {
      goTo(() => setGameState(GAMEOVER));
    }, 2500);
  }

  function restartGame() {
    clearTimeout(correctTimer.current);
    clearTimeout(wrongRevealTimer.current);
    setWrongChoice(null);
    setLastResult(null);
    setAnswerHistory([]);
    goTo(() => {
      setSession(null);
      setCurrentPathData(null);
      setSceneIndex(0);
      setGameState(INTRO);
    });
  }

  if (!questionsData) return <LoadingScreen error={loadError} />;

  const showQuestion = gameState === QUESTION
    || gameState === CORRECT
    || gameState === WRONG_REVEAL;

  return (
    <>
      {gameState === INTRO    && <IntroScreen onStart={handleStart} />}
      {gameState === SCENE    && <SceneScreen sceneIndex={sceneIndex} onChoosePath={handleChoosePath} />}

      {showQuestion && currentPathData && (
        <QuestionScreen
          question={currentPathData.question}
          difficulty={currentPathData.difficulty}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          revealCorrect={gameState === WRONG_REVEAL}
          chosenIndex={wrongChoice}
        />
      )}

      {gameState === GAMEOVER && <GameOverScreen onRestart={restartGame} result={lastResult} />}
      {gameState === VICTORY  && <VictoryScreen  onRestart={restartGame} history={answerHistory} />}

      {gameState === CORRECT  && <CorrectOverlay />}

      <TransitionOverlay
        isActive={transitioning}
        withFlash={isFirstTransition.current}
        onDone={handleTransitionDone}
      />
    </>
  );
}
