import React from 'react';

interface GameMenuProps {
  onNewGame: () => void;
  onContinue?: () => void;
  hasSavedGame: boolean;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  onNewGame,
  onContinue,
  hasSavedGame,
}) => {
  return (
    <div className="game-menu">
      <div className="menu-container">
        <h1 className="game-title">
          <span className="title-racing">RACING</span>
          <span className="title-game">GAME</span>
        </h1>
        <p className="game-subtitle">3 Rounds. 5 Opponents. 1 Champion.</p>

        <div className="menu-buttons">
          <button className="menu-button primary" onClick={onNewGame}>
            New Game
          </button>
          {hasSavedGame && onContinue && (
            <button className="menu-button secondary" onClick={onContinue}>
              Continue Game
            </button>
          )}
        </div>

        <div className="menu-controls">
          <h3>Controls</h3>
          <div className="controls-list">
            <div className="control-item">
              <span className="key">↑ / W</span>
              <span>Accelerate</span>
            </div>
            <div className="control-item">
              <span className="key">← / A</span>
              <span>Move Left</span>
            </div>
            <div className="control-item">
              <span className="key">→ / D</span>
              <span>Move Right</span>
            </div>
            <div className="control-item">
              <span className="key">↓ / S</span>
              <span>Brake</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
