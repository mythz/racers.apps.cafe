import { Racer, Track, AIInput } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

export class AIController {
  private mistakeProbability: number;

  constructor(difficulty: number = 1.0) {
    this.mistakeProbability = GAME_CONSTANTS.AI_MISTAKE_PROBABILITY / difficulty;
  }

  makeDecision(racer: Racer, track: Track, _otherRacers: Racer[]): AIInput {
    const lookAheadDistance = 100; // units ahead to check
    const absolutePosition = racer.position * GAME_CONSTANTS.TRACK_LENGTH;

    let shouldAccelerate = true;
    let targetLane = racer.lane;

    // Check for obstacles ahead
    const obstaclesAhead = this.getObstaclesInRange(
      absolutePosition,
      lookAheadDistance,
      track
    );

    // Find obstacles in current lane
    const currentLane = Math.round(racer.lane);
    const obstacleInLane = obstaclesAhead.find(
      (obs) => Math.round(obs.lane) === currentLane
    );

    if (obstacleInLane) {
      // Try to find a clear lane
      targetLane = this.findBestLane(obstaclesAhead, racer.lane);

      // Slow down if obstacle is very close
      const distance = obstacleInLane.position - absolutePosition;
      if (distance < 30) {
        shouldAccelerate = false;
      }
    }

    // Check for curves ahead
    const curveAhead = track.curves.find(
      (curve) =>
        curve.startPosition > absolutePosition &&
        curve.startPosition < absolutePosition + lookAheadDistance
    );

    if (curveAhead && Math.abs(curveAhead.intensity) > 0.5) {
      // Move to the inside of the curve
      if (curveAhead.intensity > 0) {
        // Right curve, move left
        targetLane = Math.max(0, targetLane - 1);
      } else {
        // Left curve, move right
        targetLane = Math.min(GAME_CONSTANTS.TOTAL_LANES - 1, targetLane + 1);
      }
    }

    // Add randomness to make AI less perfect
    if (Math.random() < this.mistakeProbability) {
      shouldAccelerate = !shouldAccelerate;
    }

    if (Math.random() < this.mistakeProbability * 0.5) {
      targetLane = Math.max(
        0,
        Math.min(
          GAME_CONSTANTS.TOTAL_LANES - 1,
          targetLane + (Math.random() > 0.5 ? 1 : -1)
        )
      );
    }

    return {
      accelerate: shouldAccelerate,
      targetLane,
    };
  }

  private getObstaclesInRange(
    position: number,
    range: number,
    track: Track
  ) {
    return track.obstacles.filter(
      (obs) => obs.position > position && obs.position < position + range
    );
  }

  private findBestLane(obstacles: any[], currentLane: number): number {
    const laneCounts = new Array(GAME_CONSTANTS.TOTAL_LANES).fill(0);

    // Count obstacles in each lane
    obstacles.forEach((obs) => {
      const lane = Math.round(obs.lane);
      if (lane >= 0 && lane < GAME_CONSTANTS.TOTAL_LANES) {
        laneCounts[lane]++;
      }
    });

    // Find lane with fewest obstacles, preferring lanes close to current
    let bestLane = currentLane;
    let minObstacles = laneCounts[Math.round(currentLane)];

    for (let lane = 0; lane < GAME_CONSTANTS.TOTAL_LANES; lane++) {
      const distance = Math.abs(lane - currentLane);
      // Prefer closer lanes by adding a small penalty for distance
      const score = laneCounts[lane] + distance * 0.1;

      if (score < minObstacles) {
        minObstacles = score;
        bestLane = lane;
      }
    }

    return bestLane;
  }

  convertToPlayerInput(aiInput: AIInput, currentLane: number): {
    accelerate: boolean;
    brake: boolean;
    left: boolean;
    right: boolean;
  } {
    const laneDiff = aiInput.targetLane - currentLane;

    return {
      accelerate: aiInput.accelerate,
      brake: false,
      left: laneDiff < -0.1,
      right: laneDiff > 0.1,
    };
  }
}
