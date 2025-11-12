import React from 'react';
import { GameProgress } from '../types/game.types';
import { GameState } from '../game/GameState';
import { getTrackStyleName } from '../utils/helpers';

interface LeaderboardProps {
  progress: GameProgress;
  onRestart: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  progress,
  onRestart,
}) => {
  const finalStandings = GameState.calculateFinalStandings(progress);
  const isWinner = GameState.isPlayerWinner(progress);

  return (
    <div className="leaderboard">
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">Final Results</h2>

        <div className={`victory-message ${isWinner ? 'winner' : 'loser'}`}>
          {isWinner ? (
            <>
              <div className="trophy">🏆</div>
              <h3>Congratulations!</h3>
              <p>You finished in the top 3!</p>
            </>
          ) : (
            <>
              <div className="trophy">😔</div>
              <h3>Better Luck Next Time!</h3>
              <p>Keep racing to improve your skills!</p>
            </>
          )}
        </div>

        <div className="final-standings">
          <h3>Championship Standings</h3>
          <div className="standings-table">
            {finalStandings.map((standing) => (
              <div
                key={standing.name}
                className={`final-standing-row ${standing.name === progress.playerName ? 'player' : ''} ${standing.position <= 3 ? 'podium' : ''}`}
              >
                <span className="final-pos">
                  {standing.position === 1 && '🥇'}
                  {standing.position === 2 && '🥈'}
                  {standing.position === 3 && '🥉'}
                  {standing.position > 3 && standing.position}
                </span>
                <span className="final-racer">{standing.name}</span>
                <span className="final-points">{standing.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="round-summary">
          <h3>Round Summary</h3>
          {progress.roundsCompleted.map((round) => {
            const playerResult = round.racerStandings.find(
              (s) => s.name === progress.playerName
            );
            return (
              <div key={round.roundNumber} className="round-summary-item">
                <div className="round-header">
                  <span className="round-num">Round {round.roundNumber}</span>
                  <span className="round-track">{getTrackStyleName(round.trackStyle)}</span>
                </div>
                <div className="round-result">
                  <span className="round-position">{round.playerPosition}th Place</span>
                  <span className="round-points">+{playerResult?.points || 0} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="restart-button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};
