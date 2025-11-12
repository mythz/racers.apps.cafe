import React from 'react';
import { Track, Racer as RacerType } from '../types/game.types';
import { Racer } from './Racer';
import { GAME_CONSTANTS, TRACK_STYLES } from '../utils/constants';

interface RaceTrackProps {
  track: Track;
  racers: RacerType[];
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ track, racers }) => {
  const config = TRACK_STYLES[track.style];
  const playerRacer = racers.find((r) => r.isPlayer);

  return (
    <div
      className="race-track"
      style={{
        backgroundColor: config.background,
      }}
    >
      {/* Track surface */}
      <div
        className="track-surface"
        style={{
          backgroundColor: config.roadColor,
        }}
      >
        {/* Lane markers */}
        <div className="lane-markers">
          {Array.from({ length: GAME_CONSTANTS.TOTAL_LANES - 1 }).map((_, i) => (
            <div
              key={i}
              className="lane-line"
              style={{
                left: `${((i + 1) * 100) / GAME_CONSTANTS.TOTAL_LANES}%`,
                backgroundColor: config.lineColor,
              }}
            />
          ))}
        </div>

        {/* Obstacles */}
        {track.obstacles.map((obstacle, i) => {
          const laneWidth = 100 / GAME_CONSTANTS.TOTAL_LANES;
          const left = obstacle.lane * laneWidth + laneWidth / 2;

          // Only render obstacles that are visible on screen
          const playerPos = playerRacer?.position || 0;
          const relativePos = (obstacle.position / track.length - playerPos) * 100;

          if (relativePos < -10 || relativePos > 110) {
            return null;
          }

          return (
            <div
              key={i}
              className="obstacle"
              style={{
                left: `${left}%`,
                top: `${relativePos + 10}%`,
              }}
            >
              🚧
            </div>
          );
        })}

        {/* Racers */}
        {racers.map((racer) => (
          <Racer key={racer.id} racer={racer} isPlayerView={true} />
        ))}
      </div>
    </div>
  );
};
