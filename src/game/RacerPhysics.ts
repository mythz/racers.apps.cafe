import { Racer, Track, PlayerInput } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

export class RacerPhysics {
  static update(
    racer: Racer,
    dt: number,
    input: PlayerInput,
    track: Track
  ): Racer {
    let newSpeed = racer.speed;
    let newLane = racer.lane;
    let newPosition = racer.position;

    // Calculate speed modifiers from track
    const speedModifier = this.getSpeedModifier(racer, track);

    // Acceleration
    if (input.accelerate) {
      const effectiveMaxSpeed = racer.maxSpeed * speedModifier;
      newSpeed = Math.min(effectiveMaxSpeed, racer.speed + racer.acceleration * dt);
    } else if (input.brake) {
      newSpeed = Math.max(0, racer.speed - GAME_CONSTANTS.DECELERATION * dt * 2);
    } else {
      // Natural deceleration
      newSpeed = Math.max(0, racer.speed - GAME_CONSTANTS.DECELERATION * dt * 0.5);
    }

    // Steering
    if (input.left && racer.lane > 0) {
      newLane = Math.max(0, racer.lane - GAME_CONSTANTS.LANE_CHANGE_SPEED * dt);
    } else if (input.right && racer.lane < GAME_CONSTANTS.TOTAL_LANES - 1) {
      newLane = Math.min(
        GAME_CONSTANTS.TOTAL_LANES - 1,
        racer.lane + GAME_CONSTANTS.LANE_CHANGE_SPEED * dt
      );
    }

    // Position update (normalize position to 0-1 range per lap)
    const distanceTraveled = (newSpeed * dt) / GAME_CONSTANTS.TRACK_LENGTH;
    newPosition = racer.position + distanceTraveled;

    return {
      ...racer,
      speed: newSpeed,
      lane: newLane,
      position: newPosition,
    };
  }

  private static getSpeedModifier(racer: Racer, track: Track): number {
    let modifier = 1.0;

    // Check curves
    const absolutePosition = racer.position * GAME_CONSTANTS.TRACK_LENGTH;
    for (const curve of track.curves) {
      if (absolutePosition >= curve.startPosition && absolutePosition <= curve.endPosition) {
        modifier *= GAME_CONSTANTS.CURVE_SLOWDOWN;
        break;
      }
    }

    // Check obstacles
    for (const obstacle of track.obstacles) {
      const obstacleLane = Math.round(obstacle.lane);
      const racerLane = Math.round(racer.lane);

      if (obstacleLane === racerLane) {
        const distance = Math.abs(absolutePosition - obstacle.position);
        if (distance < 20) { // Collision distance
          modifier *= GAME_CONSTANTS.OBSTACLE_SLOWDOWN;
          break;
        }
      }
    }

    return modifier;
  }

  static checkLapCompletion(racer: Racer, previousPosition: number): boolean {
    // Check if racer crossed the finish line (position wrapped from ~1.0 to 0)
    return previousPosition > 0.9 && racer.position < 0.1;
  }
}
