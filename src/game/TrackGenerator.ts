import { Track, TrackStyle, CurveSection, Obstacle } from '../types/game.types';
import { GAME_CONSTANTS, TRACK_STYLES } from '../utils/constants';
import { randomRange, randomInt } from '../utils/helpers';

export class TrackGenerator {
  static generate(style: TrackStyle): Track {
    const config = TRACK_STYLES[style];
    const length = GAME_CONSTANTS.TRACK_LENGTH;

    const curves = this.generateCurves(style, length);
    const obstacles = this.generateObstacles(style, length, curves);

    return {
      style,
      length,
      curves,
      obstacles,
      background: config.background,
      foreground: config.foreground,
      decorations: [],
    };
  }

  private static generateCurves(style: TrackStyle, length: number): CurveSection[] {
    const curves: CurveSection[] = [];
    const curvePatterns = {
      city: { count: 8, intensity: 0.7 },
      desert: { count: 5, intensity: 0.4 },
      forest: { count: 10, intensity: 0.8 },
      snow: { count: 7, intensity: 0.6 },
      beach: { count: 6, intensity: 0.5 },
    };

    const pattern = curvePatterns[style];
    const segmentLength = length / pattern.count;

    for (let i = 0; i < pattern.count; i++) {
      const startPosition = i * segmentLength;
      const endPosition = (i + 1) * segmentLength;
      const intensity = randomRange(-pattern.intensity, pattern.intensity);

      curves.push({
        startPosition,
        endPosition,
        intensity,
      });
    }

    return curves;
  }

  private static generateObstacles(
    style: TrackStyle,
    length: number,
    _curves: CurveSection[]
  ): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const obstacleTypes = {
      city: ['car', 'cone', 'barrier'],
      desert: ['cactus', 'rock', 'tumbleweed'],
      forest: ['tree', 'log', 'stump'],
      snow: ['snowman', 'ice', 'rock'],
      beach: ['palm', 'umbrella', 'surfboard'],
    };

    const types = obstacleTypes[style];
    const obstacleCount = randomInt(15, 25);

    for (let i = 0; i < obstacleCount; i++) {
      const position = randomRange(length * 0.1, length * 0.9);
      const lane = randomInt(0, GAME_CONSTANTS.TOTAL_LANES - 1);
      const type = types[randomInt(0, types.length - 1)];

      // Don't place obstacles too close together in the same lane
      const tooClose = obstacles.some(
        (obs) =>
          obs.lane === lane &&
          Math.abs(obs.position - position) < length * 0.05
      );

      if (!tooClose) {
        obstacles.push({
          position,
          lane,
          type,
        });
      }
    }

    return obstacles.sort((a, b) => a.position - b.position);
  }
}
