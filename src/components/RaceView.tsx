import React, { useState, useEffect, useRef } from 'react';
import { RaceState } from '../types/game.types';
import { GameEngine } from '../game/GameEngine';
import { RaceTrack } from './RaceTrack';
import { RaceHUD } from './RaceHUD';
import { Countdown } from './Countdown';
import { useKeyboard } from '../hooks/useKeyboard';

interface RaceViewProps {
  initialRaceState: RaceState;
  onFinish: (finalState: RaceState) => void;
}

export const RaceView: React.FC<RaceViewProps> = ({
  initialRaceState,
  onFinish,
}) => {
  const [raceState, setRaceState] = useState<RaceState>(initialRaceState);
  const [countdown, setCountdown] = useState<number>(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const playerInput = useKeyboard();

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Start race after countdown
      setTimeout(() => {
        setShowCountdown(false);
        startRace();
      }, 1000);
    }
  }, [countdown]);

  const startRace = () => {
    const updatedState = {
      ...raceState,
      raceStarted: true,
    };
    setRaceState(updatedState);

    gameEngineRef.current = new GameEngine(
      updatedState,
      (newState) => setRaceState(newState),
      () => playerInput
    );
    gameEngineRef.current.start();
  };

  // Check if race is finished
  useEffect(() => {
    if (raceState.raceFinished && gameEngineRef.current) {
      gameEngineRef.current.stop();
      // Delay before showing results
      setTimeout(() => {
        onFinish(raceState);
      }, 2000);
    }
  }, [raceState.raceFinished]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="race-view">
      {showCountdown && <Countdown count={countdown} />}
      <RaceTrack track={raceState.track} racers={raceState.racers} />
      <RaceHUD raceState={raceState} />
      {raceState.raceFinished && (
        <div className="race-finished-overlay">
          <h2>Race Complete!</h2>
        </div>
      )}
    </div>
  );
};
