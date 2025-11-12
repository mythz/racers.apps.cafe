import { RaceState, Racer, PlayerInput } from '../types/game.types';
import { RacerPhysics } from './RacerPhysics';
import { AIController } from './AIController';
import { GAME_CONSTANTS } from '../utils/constants';

export class GameEngine {
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private aiControllers: Map<string, AIController> = new Map();
  private isRunning = false;

  constructor(
    private raceState: RaceState,
    private onUpdate: (state: RaceState) => void,
    private getPlayerInput: () => PlayerInput
  ) {
    // Create AI controllers for each AI racer
    raceState.racers.forEach((racer) => {
      if (!racer.isPlayer) {
        this.aiControllers.set(racer.id, new AIController());
      }
    });
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    if (!this.raceState.raceStarted || this.raceState.raceFinished) {
      return;
    }

    const updatedRacers: Racer[] = [];
    let finishPositionCounter = this.raceState.racers.filter((r) => r.hasFinished).length + 1;

    // Update each racer
    for (const racer of this.raceState.racers) {
      if (racer.hasFinished) {
        updatedRacers.push(racer);
        continue;
      }

      // Get input for this racer
      let input: PlayerInput;
      if (racer.isPlayer) {
        input = this.getPlayerInput();
      } else {
        const aiController = this.aiControllers.get(racer.id);
        if (aiController) {
          const aiInput = aiController.makeDecision(
            racer,
            this.raceState.track,
            this.raceState.racers
          );
          input = aiController.convertToPlayerInput(aiInput, racer.lane);
        } else {
          input = { accelerate: false, brake: false, left: false, right: false };
        }
      }

      // Store previous position to check lap completion
      const previousPosition = racer.position;

      // Update racer physics
      let updatedRacer = RacerPhysics.update(racer, dt, input, this.raceState.track);

      // Update total time
      updatedRacer = {
        ...updatedRacer,
        totalTime: racer.totalTime + dt * 1000, // Convert to ms
      };

      // Check lap completion
      if (RacerPhysics.checkLapCompletion(updatedRacer, previousPosition)) {
        const newLap = racer.currentLap + 1;
        const lapTime = updatedRacer.totalTime - racer.lapTimes.reduce((a, b) => a + b, 0);

        updatedRacer = {
          ...updatedRacer,
          currentLap: newLap,
          lapTimes: [...racer.lapTimes, lapTime],
          position: 0, // Reset position for new lap
        };

        // Check if race is finished for this racer
        if (newLap >= GAME_CONSTANTS.LAPS_PER_RACE) {
          updatedRacer = {
            ...updatedRacer,
            hasFinished: true,
            finishPosition: finishPositionCounter++,
          };
        }
      }

      updatedRacers.push(updatedRacer);
    }

    // Update race state
    const newState: RaceState = {
      ...this.raceState,
      racers: updatedRacers,
      raceTime: this.raceState.raceTime + dt * 1000,
      raceFinished: updatedRacers.every((r) => r.hasFinished),
    };

    this.raceState = newState;
    this.onUpdate(newState);
  }

  getCurrentState(): RaceState {
    return this.raceState;
  }
}
