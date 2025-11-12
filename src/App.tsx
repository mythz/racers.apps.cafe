import { useState, useEffect } from 'react';
import { GameScreen, GameProgress, TrackStyle, RaceState } from './types/game.types';
import { GameState } from './game/GameState';
import { TrackGenerator } from './game/TrackGenerator';
import { useStorage } from './hooks/useStorage';
import { GameMenu } from './components/GameMenu';
import { TrackSelector } from './components/TrackSelector';
import { RaceView } from './components/RaceView';
import { ResultsScreen } from './components/ResultsScreen';
import { Leaderboard } from './components/Leaderboard';
import { GAME_CONSTANTS } from './utils/constants';
import './App.css';

function App() {
  const [gameScreen, setGameScreen] = useState<GameScreen>('menu');
  const [progress, setProgress] = useState<GameProgress>(
    GameState.createInitialProgress('Player')
  );
  const [currentRaceState, setCurrentRaceState] = useState<RaceState | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const storage = useStorage();

  // Initialize and load saved game
  useEffect(() => {
    if (storage.initialized) {
      storage.loadGame().then((saved) => {
        if (saved && saved.currentRound <= GAME_CONSTANTS.TOTAL_ROUNDS) {
          setHasSavedGame(true);
        }
      });
    }
  }, [storage.initialized]);

  const handleNewGame = () => {
    const newProgress = GameState.createInitialProgress('Player');
    setProgress(newProgress);
    setGameScreen('track-select');
  };

  const handleContinueGame = async () => {
    const saved = await storage.loadGame();
    if (saved) {
      setProgress(saved);
      if (saved.selectedTrack) {
        setGameScreen('track-select');
      } else {
        setGameScreen('track-select');
      }
    }
  };

  const handleTrackSelect = (style: TrackStyle) => {
    const updatedProgress = {
      ...progress,
      selectedTrack: style,
    };
    setProgress(updatedProgress);

    // Generate track and create race state
    const track = TrackGenerator.generate(style);
    const raceState = GameState.createRaceState(
      updatedProgress.currentRound,
      track,
      updatedProgress.playerName
    );
    setCurrentRaceState(raceState);
    setGameScreen('racing');
  };

  const handleRaceFinish = async (finalState: RaceState) => {
    // Calculate round result
    const roundResult = GameState.calculateRoundResult(finalState);

    // Update progress
    const updatedProgress = GameState.updateProgress(progress, roundResult);
    setProgress(updatedProgress);

    // Save progress
    try {
      await storage.saveGame(updatedProgress);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }

    // Show results
    setGameScreen('results');
  };

  const handleContinueFromResults = () => {
    if (progress.currentRound > GAME_CONSTANTS.TOTAL_ROUNDS) {
      // All rounds complete, show final results
      setGameScreen('final');
    } else {
      // Continue to next round
      setGameScreen('track-select');
    }
  };

  const handleRestart = async () => {
    // Clear saved game
    try {
      await storage.clearAll();
    } catch (err) {
      console.error('Failed to clear saved game:', err);
    }

    // Reset to menu
    setProgress(GameState.createInitialProgress('Player'));
    setHasSavedGame(false);
    setGameScreen('menu');
  };

  if (!storage.initialized) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      {gameScreen === 'menu' && (
        <GameMenu
          onNewGame={handleNewGame}
          onContinue={handleContinueGame}
          hasSavedGame={hasSavedGame}
        />
      )}

      {gameScreen === 'track-select' && (
        <TrackSelector onSelect={handleTrackSelect} />
      )}

      {gameScreen === 'racing' && currentRaceState && (
        <RaceView
          initialRaceState={currentRaceState}
          onFinish={handleRaceFinish}
        />
      )}

      {gameScreen === 'results' && progress.roundsCompleted.length > 0 && (
        <ResultsScreen
          result={progress.roundsCompleted[progress.roundsCompleted.length - 1]}
          onContinue={handleContinueFromResults}
          isLastRound={progress.currentRound > GAME_CONSTANTS.TOTAL_ROUNDS}
        />
      )}

      {gameScreen === 'final' && (
        <Leaderboard progress={progress} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
