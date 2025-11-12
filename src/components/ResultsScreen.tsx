import React from 'react';
import { RoundResult } from '../types/game.types';
import { formatTime, getPositionSuffix, getTrackStyleName } from '../utils/helpers';

interface ResultsScreenProps {
  result: RoundResult;
  onContinue: () => void;
  isLastRound: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onContinue,
  isLastRound,
}) => {
  const playerStanding = result.racerStandings.find(
    (s) => s.position === result.playerPosition
  );

  return (
    <div className="results-screen">
      <div className="results-container">
        <h2 className="results-title">
          Round {result.roundNumber} Complete!
        </h2>

        <div className="results-track">
          <span className="track-icon">🏁</span>
          <span>{getTrackStyleName(result.trackStyle)}</span>
        </div>

        <div className="results-player">
          <div className="player-position">
            <span className="position-large">{result.playerPosition}</span>
            <span className="position-suffix-large">
              {getPositionSuffix(result.playerPosition)}
            </span>
          </div>
          <div className="player-time">{formatTime(result.time)}</div>
          <div className="player-points">
            +{playerStanding?.points || 0} points
          </div>
        </div>

        <div className="results-standings">
          <h3>Final Standings</h3>
          <div className="standings-table">
            {result.racerStandings.map((standing) => (
              <div
                key={standing.name}
                className={`standing-row ${standing.position === result.playerPosition ? 'player' : ''}`}
              >
                <span className="standing-pos">{standing.position}</span>
                <span className="standing-racer">{standing.name}</span>
                <span className="standing-pts">+{standing.points}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="continue-button" onClick={onContinue}>
          {isLastRound ? 'View Final Results' : `Continue to Round ${result.roundNumber + 1}`}
        </button>
      </div>
    </div>
  );
};
