// ─── Imports ────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import './styles/global.css';

import IntroScreen       from './components/IntroScreen.jsx';
import SceneScreen       from './components/SceneScreen.jsx';
import QuestionScreen    from './components/QuestionScreen.jsx';
import GameOverScreen    from './components/GameOverScreen.jsx';
import VictoryScreen     from './components/VictoryScreen.jsx';
import LoadingScreen     from './components/LoadingScreen.jsx';
import TransitionOverlay from './components/TransitionOverlay.jsx';
import CorrectOverlay    from './components/CorrectOverlay.jsx';

import { fetchQuestions }                          from './utils/fetchQuestions.js';
import { initSession, INTRO, SCENE, QUESTION,
         CORRECT, WRONG_REVEAL, GAMEOVER, VICTORY } from './utils/session.js';
import { PRELOAD_IMGS }                            from './utils/preload.js';


// ─── Componente principal ────────────────────────────────────────────────────
export default function App() {

  // --- Carregamento inicial ---
  const [questionsData, setQuestionsData] = useState(null);
  const [imagesReady,   setImagesReady]   = useState(false);
  const [loadError,     setLoadError]     = useState(null);

  useEffect(() => {
    fetchQuestions()
      .then(data => setQuestionsData(data))
      .catch(err  => setLoadError(err.message));
  }, []);

  // Aguarda todas as imagens antes de liberar o jogo (evita flash de tela branca)
  useEffect(() => {
    const promises = PRELOAD_IMGS.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload  = resolve;
      img.onerror = resolve;
      img.src = src;
    }));
    Promise.all(promises).then(() => setImagesReady(true));
  }, []);

  // --- Estado do jogo ---
  const [gameState,       setGameState]       = useState(INTRO);
  const [sceneIndex,      setSceneIndex]      = useState(0);
  const [session,         setSession]         = useState(null);
  const [currentPathData, setCurrentPathData] = useState(null);
  const [lastResult,      setLastResult]      = useState(null);
  const [wrongChoice,     setWrongChoice]     = useState(null);

  // --- Transição de tela ---
  const [transitioning, setTransitioning] = useState(false);
  const [withFlash,     setWithFlash]     = useState(false);
  const pendingAction   = useRef(null);

  // Timers internos que precisam ser cancelados no restart
  const correctTimer     = useRef(null);
  const wrongRevealTimer = useRef(null);

  // --- Handlers de transição ---
  function goTo(action) {
    if (transitioning) return;
    pendingAction.current = action;
    setTransitioning(true);
  }

  function handleTransitionDone() {
    pendingAction.current?.();
    pendingAction.current = null;
    setWithFlash(false);
    setTransitioning(false);
  }

  // --- Handlers do fluxo de jogo ---
  function handleStart() {
    setWithFlash(true);
    try { document.documentElement.requestFullscreen?.(); } catch { /* fullscreen não suportado */ }
    setSession(initSession(questionsData));
    setSceneIndex(0);
    goTo(() => setGameState(SCENE));
  }

  function handleChoosePath(pathIndex) {
    const pathData = session.scenes[sceneIndex].paths[pathIndex];
    setCurrentPathData(pathData);
    goTo(() => setGameState(QUESTION));
  }

  function handleCorrect() {
    const nextAction = sceneIndex === 2
      ? () => setGameState(VICTORY)
      : () => { setSceneIndex(sceneIndex + 1); setGameState(SCENE); };

    setGameState(CORRECT);
    correctTimer.current = setTimeout(() => goTo(nextAction), 1800);
  }

  function handleWrong(chosenIndex = -1) {
    setLastResult({ question: currentPathData.question, chosenIndex, phase: sceneIndex + 1 });
    setWrongChoice(chosenIndex);
    setGameState(WRONG_REVEAL);
    wrongRevealTimer.current = setTimeout(() => goTo(() => setGameState(GAMEOVER)), 2500);
  }

  function restartGame() {
    clearTimeout(correctTimer.current);
    clearTimeout(wrongRevealTimer.current);
    setLastResult(null);
    setWrongChoice(null);
    goTo(() => {
      setSession(null);
      setCurrentPathData(null);
      setSceneIndex(0);
      setGameState(INTRO);
    });
  }

  // --- Render ---
  if (!questionsData || !imagesReady) return <LoadingScreen error={loadError} />;

  const showQuestion = gameState === QUESTION
    || gameState === CORRECT
    || gameState === WRONG_REVEAL;

  return (
    <>
      {gameState === INTRO && <IntroScreen onStart={handleStart} />}
      {gameState === SCENE && <SceneScreen sceneIndex={sceneIndex} onChoosePath={handleChoosePath} />}

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

      {gameState === CORRECT  && <CorrectOverlay />}
      {gameState === GAMEOVER && <GameOverScreen onRestart={restartGame} result={lastResult} />}
      {gameState === VICTORY  && <VictoryScreen  onRestart={restartGame} />}

      <TransitionOverlay
        isActive={transitioning}
        withFlash={withFlash}
        onDone={handleTransitionDone}
      />
    </>
  );
}
