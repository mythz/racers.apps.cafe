// Track styles the player can choose
export type TrackStyle = 'city' | 'desert' | 'forest' | 'snow' | 'beach';

// Game state screens
export type GameScreen = 'menu' | 'track-select' | 'countdown' | 'racing' | 'results' | 'final';

// Racer position and state
export interface Racer {
  id: string;
  name: string;
  position: number;        // Track position (0-100%)
  speed: number;           // Current speed
  acceleration: number;
  maxSpeed: number;
  isPlayer: boolean;
  lane: number;            // 0-5 for 6 lanes
  color: string;
  avatar: string;
  currentLap: number;
  lapTimes: number[];
  totalTime: number;
  finishPosition?: number;
  hasFinished: boolean;
}

// Track configuration
export interface Track {
  style: TrackStyle;
  length: number;          // Total track length
  curves: CurveSection[];
  obstacles: Obstacle[];
  background: string;
  foreground: string;
  decorations: string[];
}

export interface CurveSection {
  startPosition: number;
  endPosition: number;
  intensity: number;       // -1 (left) to 1 (right)
}

export interface Obstacle {
  position: number;
  lane: number;
  type: string;
}

// Race state
export interface RaceState {
  racers: Racer[];
  currentRound: number;    // 1, 2, or 3
  currentLap: number;
  totalLaps: number;
  raceStarted: boolean;
  raceFinished: boolean;
  raceTime: number;
  countdown: number;       // 3, 2, 1, 0 (go)
  track: Track;
}

// Game progress
export interface GameProgress {
  currentRound: number;
  roundsCompleted: RoundResult[];
  selectedTrack: TrackStyle | null;
  playerName: string;
  totalScore: number;
}

export interface RoundResult {
  roundNumber: number;
  playerPosition: number;
  time: number;
  trackStyle: TrackStyle;
  racerStandings: { name: string; position: number; points: number }[];
}

// Player input
export interface PlayerInput {
  accelerate: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
}

// AI decision
export interface AIInput {
  accelerate: boolean;
  targetLane: number;
}
