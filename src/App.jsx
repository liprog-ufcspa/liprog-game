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
import MuteButton        from './components/MuteButton.jsx';

import { fetchQuestions }                                    from './utils/fetchQuestions.js';
import { initSession, isQuestionActive, INTRO, SCENE,
         QUESTION, CORRECT, WRONG_REVEAL, GAMEOVER, VICTORY } from './utils/session.js';
import { PRELOAD_IMGS }                                      from './utils/preload.js';
import {
  startBg, setMuted,
  playCorrect, playWrong, playVictory, playGameover, playTimeout,
} from './utils/sound.js';


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
  const [isMuted,         setIsMuted]         = useState(false);
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

  // --- Timers: avança estado automaticamente após CORRECT e WRONG_REVEAL ---
  useEffect(() => {
    if (gameState === CORRECT) {
      const action = sceneIndex === 2
        ? () => setGameState(VICTORY)
        : () => { setSceneIndex(i => i + 1); setGameState(SCENE); };
      const t = setTimeout(() => {
        pendingAction.current = action;
        setTransitioning(true);
      }, 1800);
      return () => clearTimeout(t);
    }
    if (gameState === WRONG_REVEAL) {
      const t = setTimeout(() => {
        pendingAction.current = () => setGameState(GAMEOVER);
        setTransitioning(true);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [gameState, sceneIndex]);

  // --- Áudio dos estados terminais ---
  useEffect(() => {
    if (gameState === VICTORY)  playVictory();
    if (gameState === GAMEOVER) playGameover();
  }, [gameState]);

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
  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    setMuted(next);
  }

  function handleStart() {
    setWithFlash(true);
    try { document.documentElement.requestFullscreen?.(); } catch { /* fullscreen não suportado */ }
    startBg();
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
    playCorrect();
    setGameState(CORRECT);
  }

  function handleWrong(chosenIndex = -1) {
    if (chosenIndex === -1) playTimeout(); else playWrong();
    setLastResult({ question: currentPathData.question, chosenIndex, phase: sceneIndex + 1 });
    setWrongChoice(chosenIndex);
    setGameState(WRONG_REVEAL);
  }

  function restartGame() {
    window.location.reload();
  }

  // --- Render ---
  if (!questionsData || !imagesReady) return <LoadingScreen error={loadError} />;

  return (
    <>
      {gameState === INTRO && <IntroScreen onStart={handleStart} />}
      {gameState === SCENE && <SceneScreen sceneIndex={sceneIndex} onChoosePath={handleChoosePath} />}

      {isQuestionActive(gameState) && currentPathData && (
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

      {gameState !== INTRO && (
        <MuteButton isMuted={isMuted} onToggle={toggleMute} />
      )}

      <TransitionOverlay
        isActive={transitioning}
        withFlash={withFlash}
        onDone={handleTransitionDone}
      />
    </>
  );
}
