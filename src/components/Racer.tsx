import React from 'react';
import { Racer as RacerType } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

interface RacerProps {
  racer: RacerType;
  isPlayerView: boolean;
}

export const Racer: React.FC<RacerProps> = ({ racer, isPlayerView }) => {
  // Calculate position on screen
  const laneWidth = 100 / GAME_CONSTANTS.TOTAL_LANES;
  const left = racer.lane * laneWidth;

  // In player view, player is always centered vertically
  // Other racers move relative to player
  const top = isPlayerView && racer.isPlayer ? 70 : racer.position * 80 + 10;

  return (
    <div
      className={`racer ${racer.isPlayer ? 'player' : 'ai'} ${racer.hasFinished ? 'finished' : ''}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        backgroundColor: racer.color,
        opacity: racer.hasFinished ? 0.5 : 1,
      }}
    >
      <div className="racer-body"></div>
      <div className="racer-name">{racer.name}</div>
    </div>
  );
};
