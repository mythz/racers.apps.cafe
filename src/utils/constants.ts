export const GAME_CONSTANTS = {
  TOTAL_ROUNDS: 3,
  RACERS_PER_RACE: 6, // 1 player + 5 AI
  LAPS_PER_RACE: 3,
  TRACK_LENGTH: 1000, // arbitrary units

  // Player stats
  PLAYER_MAX_SPEED: 100,
  PLAYER_ACCELERATION: 50,

  // AI stats (varied)
  AI_MAX_SPEED_RANGE: [85, 105] as [number, number],
  AI_ACCELERATION_RANGE: [40, 55] as [number, number],
  AI_MISTAKE_PROBABILITY: 0.05,

  // Physics
  DECELERATION: 30,
  LANE_CHANGE_SPEED: 2, // lanes per second
  OBSTACLE_SLOWDOWN: 0.5, // multiply speed by this
  CURVE_SLOWDOWN: 0.8,

  // Scoring
  POINTS_BY_POSITION: [10, 8, 6, 4, 2, 0],

  // Track
  TOTAL_LANES: 6,
  LANE_WIDTH: 80, // pixels

  // Timing
  COUNTDOWN_DURATION: 3000, // ms
  LAP_TIME_START: 0,
};

export const RACER_NAMES = [
  'Speedster', 'Lightning', 'Thunder', 'Blaze', 'Storm',
  'Rocket', 'Flash', 'Turbo', 'Nitro', 'Viper'
];

export const RACER_COLORS = [
  '#FF4136', // Red
  '#0074D9', // Blue
  '#2ECC40', // Green
  '#FFDC00', // Yellow
  '#FF851B', // Orange
  '#B10DC9', // Purple
  '#F012BE', // Magenta
  '#01FF70', // Lime
  '#7FDBFF', // Aqua
  '#85144b', // Maroon
];

export const TRACK_STYLES = {
  city: {
    name: 'City Streets',
    description: 'Race through neon-lit urban canyons',
    background: '#1a1a2e',
    foreground: '#16213e',
    roadColor: '#3a3a4a',
    lineColor: '#ffdd00',
    sideColor: '#2a2a3a',
  },
  desert: {
    name: 'Desert Dunes',
    description: 'Speed across endless sandy terrain',
    background: '#ff9a56',
    foreground: '#ffd28f',
    roadColor: '#d4a574',
    lineColor: '#ffffff',
    sideColor: '#c9994b',
  },
  forest: {
    name: 'Forest Trail',
    description: 'Navigate through dense woodland paths',
    background: '#2d5016',
    foreground: '#4a7c2c',
    roadColor: '#6b5b3d',
    lineColor: '#ffdd00',
    sideColor: '#3d5a1e',
  },
  snow: {
    name: 'Snow Pass',
    description: 'Drift through icy mountain roads',
    background: '#b8d4e8',
    foreground: '#d4e8f5',
    roadColor: '#c0d4e0',
    lineColor: '#333333',
    sideColor: '#a8c4d8',
  },
  beach: {
    name: 'Beach Paradise',
    description: 'Cruise along sunny coastal roads',
    background: '#87ceeb',
    foreground: '#f0e68c',
    roadColor: '#f5deb3',
    lineColor: '#ffffff',
    sideColor: '#daa520',
  },
};
