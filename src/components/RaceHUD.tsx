import React from 'react';
import { RaceState } from '../types/game.types';
import { formatTime, getPositionSuffix, sortRacersByPosition } from '../utils/helpers';

interface RaceHUDProps {
  raceState: RaceState;
}

export const RaceHUD: React.FC<RaceHUDProps> = ({ raceState }) => {
  const playerRacer = raceState.racers.find((r) => r.isPlayer);
  const sortedRacers = sortRacersByPosition(raceState.racers);
  const playerPosition =
    sortedRacers.findIndex((r) => r.id === playerRacer?.id) + 1;

  return (
    <div className="race-hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-position">
          <span className="position-number">{playerPosition}</span>
          <span className="position-suffix">{getPositionSuffix(playerPosition)}</span>
        </div>

        <div className="hud-lap">
          Lap {playerRacer?.currentLap || 0} / {raceState.totalLaps}
        </div>

        <div className="hud-time">
          {formatTime(playerRacer?.totalTime || 0)}
        </div>
      </div>

      {/* Standings sidebar */}
      <div className="hud-standings">
        <h4>Standings</h4>
        <div className="standings-list">
          {sortedRacers.map((racer, index) => (
            <div
              key={racer.id}
              className={`standing-item ${racer.isPlayer ? 'player' : ''}`}
            >
              <span className="standing-position">{index + 1}</span>
              <span className="standing-name">{racer.name}</span>
              <span className="standing-lap">L{racer.currentLap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speed indicator */}
      <div className="hud-speed">
        <div className="speed-label">Speed</div>
        <div className="speed-bar">
          <div
            className="speed-fill"
            style={{
              width: `${((playerRacer?.speed || 0) / (playerRacer?.maxSpeed || 100)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
