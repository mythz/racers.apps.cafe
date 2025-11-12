import React, { useState } from 'react';
import { TrackStyle } from '../types/game.types';
import { TRACK_STYLES } from '../utils/constants';

interface TrackSelectorProps {
  onSelect: (style: TrackStyle) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({ onSelect }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackStyle | null>(null);

  const tracks: TrackStyle[] = ['city', 'desert', 'forest', 'snow', 'beach'];

  const handleSelect = (style: TrackStyle) => {
    setSelectedTrack(style);
  };

  const handleConfirm = () => {
    if (selectedTrack) {
      onSelect(selectedTrack);
    }
  };

  return (
    <div className="track-selector">
      <div className="selector-container">
        <h2 className="selector-title">Choose Your Track</h2>

        <div className="tracks-grid">
          {tracks.map((style) => {
            const config = TRACK_STYLES[style];
            return (
              <div
                key={style}
                className={`track-card ${selectedTrack === style ? 'selected' : ''}`}
                onClick={() => handleSelect(style)}
                style={{
                  backgroundColor: config.background,
                  borderColor: selectedTrack === style ? '#ffdd00' : 'transparent',
                }}
              >
                <div className="track-preview" style={{ backgroundColor: config.foreground }}>
                  <div className="track-lanes">
                    {[0, 1, 2, 3, 4, 5].map((lane) => (
                      <div
                        key={lane}
                        className="preview-lane"
                        style={{ borderColor: config.lineColor }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="track-name">{config.name}</h3>
                <p className="track-description">{config.description}</p>
              </div>
            );
          })}
        </div>

        <button
          className="confirm-button"
          onClick={handleConfirm}
          disabled={!selectedTrack}
        >
          Start Race
        </button>
      </div>
    </div>
  );
};
