import { RaceState, Racer, Track, GameProgress, RoundResult } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';
import { createPlayerRacer, createAIRacer, calculatePoints } from '../utils/helpers';

export class GameState {
  static createInitialProgress(playerName: string = 'Player'): GameProgress {
    return {
      currentRound: 1,
      roundsCompleted: [],
      selectedTrack: null,
      playerName,
      totalScore: 0,
    };
  }

  static createRaceState(
    roundNumber: number,
    track: Track,
    playerName: string = 'Player'
  ): RaceState {
    const racers: Racer[] = [];

    // Create player racer
    racers.push(createPlayerRacer(playerName));

    // Create AI racers
    for (let i = 0; i < GAME_CONSTANTS.RACERS_PER_RACE - 1; i++) {
      racers.push(createAIRacer(i, roundNumber));
    }

    return {
      racers,
      currentRound: roundNumber,
      currentLap: 0,
      totalLaps: GAME_CONSTANTS.LAPS_PER_RACE,
      raceStarted: false,
      raceFinished: false,
      raceTime: 0,
      countdown: 3,
      track,
    };
  }

  static updateRaceState(
    state: RaceState,
    updatedRacers: Racer[],
    deltaTime: number
  ): RaceState {
    const newRaceTime = state.raceTime + deltaTime * 1000; // Convert to ms

    // Check if all racers have finished
    const allFinished = updatedRacers.every((r) => r.hasFinished);

    return {
      ...state,
      racers: updatedRacers,
      raceTime: newRaceTime,
      raceFinished: allFinished,
    };
  }

  static calculateRoundResult(raceState: RaceState): RoundResult {
    const sortedRacers = [...raceState.racers].sort((a, b) => {
      if (a.finishPosition === undefined) return 1;
      if (b.finishPosition === undefined) return -1;
      return a.finishPosition - b.finishPosition;
    });

    const playerRacer = sortedRacers.find((r) => r.isPlayer);
    const playerPosition = playerRacer?.finishPosition || GAME_CONSTANTS.RACERS_PER_RACE;

    return {
      roundNumber: raceState.currentRound,
      playerPosition,
      time: playerRacer?.totalTime || 0,
      trackStyle: raceState.track.style,
      racerStandings: sortedRacers.map((r) => ({
        name: r.name,
        position: r.finishPosition || GAME_CONSTANTS.RACERS_PER_RACE,
        points: calculatePoints(r.finishPosition || GAME_CONSTANTS.RACERS_PER_RACE),
      })),
    };
  }

  static updateProgress(
    progress: GameProgress,
    roundResult: RoundResult
  ): GameProgress {
    const playerPoints = calculatePoints(roundResult.playerPosition);

    return {
      ...progress,
      currentRound: progress.currentRound + 1,
      roundsCompleted: [...progress.roundsCompleted, roundResult],
      totalScore: progress.totalScore + playerPoints,
    };
  }

  static calculateFinalStandings(progress: GameProgress): {
    name: string;
    totalPoints: number;
    position: number;
  }[] {
    // Collect all racer names and their points
    const racerPoints = new Map<string, number>();

    progress.roundsCompleted.forEach((round) => {
      round.racerStandings.forEach((standing) => {
        const current = racerPoints.get(standing.name) || 0;
        racerPoints.set(standing.name, current + standing.points);
      });
    });

    // Convert to array and sort
    const standings = Array.from(racerPoints.entries())
      .map(([name, totalPoints]) => ({ name, totalPoints, position: 0 }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return standings;
  }

  static isPlayerWinner(progress: GameProgress): boolean {
    const standings = this.calculateFinalStandings(progress);
    const playerStanding = standings.find((s) => s.name === progress.playerName);
    return playerStanding ? playerStanding.position <= 3 : false;
  }
}
