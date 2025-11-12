import { Racer, TrackStyle } from '../types/game.types';
import { GAME_CONSTANTS, RACER_NAMES, RACER_COLORS } from './constants';

export function generateRacerId(): string {
  return `racer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function getPositionSuffix(position: number): string {
  const lastDigit = position % 10;
  const lastTwoDigits = position % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function createAIRacer(index: number, roundNumber: number): Racer {
  // Increase AI difficulty with each round
  const difficultyMultiplier = 1 + (roundNumber - 1) * 0.1;

  const [minSpeed, maxSpeed] = GAME_CONSTANTS.AI_MAX_SPEED_RANGE;
  const [minAccel, maxAccel] = GAME_CONSTANTS.AI_ACCELERATION_RANGE;

  const availableNames = RACER_NAMES.filter(name => name !== 'Player');
  const shuffledNames = shuffle(availableNames);

  return {
    id: generateRacerId(),
    name: shuffledNames[index] || `Racer ${index + 1}`,
    position: 0,
    speed: 0,
    acceleration: randomRange(minAccel, maxAccel) * difficultyMultiplier,
    maxSpeed: randomRange(minSpeed, maxSpeed) * difficultyMultiplier,
    isPlayer: false,
    lane: index % GAME_CONSTANTS.TOTAL_LANES,
    color: RACER_COLORS[index + 1] || randomElement(RACER_COLORS),
    avatar: '🏎️',
    currentLap: 0,
    lapTimes: [],
    totalTime: 0,
    hasFinished: false,
  };
}

export function createPlayerRacer(name: string = 'Player'): Racer {
  return {
    id: generateRacerId(),
    name,
    position: 0,
    speed: 0,
    acceleration: GAME_CONSTANTS.PLAYER_ACCELERATION,
    maxSpeed: GAME_CONSTANTS.PLAYER_MAX_SPEED,
    isPlayer: true,
    lane: Math.floor(GAME_CONSTANTS.TOTAL_LANES / 2),
    color: RACER_COLORS[0],
    avatar: '🏎️',
    currentLap: 0,
    lapTimes: [],
    totalTime: 0,
    hasFinished: false,
  };
}

export function calculatePoints(position: number): number {
  if (position < 1 || position > GAME_CONSTANTS.POINTS_BY_POSITION.length) {
    return 0;
  }
  return GAME_CONSTANTS.POINTS_BY_POSITION[position - 1];
}

export function sortRacersByPosition(racers: Racer[]): Racer[] {
  return [...racers].sort((a, b) => {
    // If both finished, sort by finish position
    if (a.hasFinished && b.hasFinished) {
      return (a.finishPosition || 0) - (b.finishPosition || 0);
    }
    // If one finished and one hasn't, finished comes first
    if (a.hasFinished) return -1;
    if (b.hasFinished) return 1;

    // Sort by lap and position
    if (a.currentLap !== b.currentLap) {
      return b.currentLap - a.currentLap;
    }
    return b.position - a.position;
  });
}

export function getTrackStyleName(style: TrackStyle): string {
  const styles = {
    city: 'City Streets',
    desert: 'Desert Dunes',
    forest: 'Forest Trail',
    snow: 'Snow Pass',
    beach: 'Beach Paradise',
  };
  return styles[style];
}
