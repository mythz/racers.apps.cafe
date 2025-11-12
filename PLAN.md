# Detailed Implementation Plan: Racing Game with React + Vite + TypeScript

## 1. Project Setup & Architecture

### 1.1 Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Storage**: IndexedDB (primary) with localStorage fallback
- **Animation**: CSS transitions + requestAnimationFrame
- **State Management**: React hooks (useState, useReducer, useContext)

### 1.2 Project Structure
```
src/
├── components/
│   ├── GameMenu.tsx           # Main menu interface
│   ├── TrackSelector.tsx      # Track style selection screen
│   ├── RaceView.tsx           # Main racing game view
│   ├── Racer.tsx              # Individual racer component
│   ├── RaceTrack.tsx          # Track rendering component
│   ├── RaceHUD.tsx            # Heads-up display (position, lap, timer)
│   ├── ResultsScreen.tsx      # Round/game results
│   └── Leaderboard.tsx        # Final standings
├── game/
│   ├── GameEngine.ts          # Core game loop and physics
│   ├── AIController.ts        # AI bot logic
│   ├── RacerPhysics.ts        # Movement, acceleration, collision
│   ├── TrackGenerator.ts      # Track layout generation
│   └── GameState.ts           # Game state management
├── storage/
│   ├── StorageManager.ts      # Abstract storage interface
│   ├── IndexedDBAdapter.ts    # IndexedDB implementation
│   └── LocalStorageAdapter.ts # localStorage fallback
├── types/
│   ├── game.types.ts          # Game-related TypeScript types
│   └── storage.types.ts       # Storage-related types
├── hooks/
│   ├── useGameLoop.ts         # Custom hook for game loop
│   ├── useStorage.ts          # Custom hook for storage operations
│   └── useKeyboard.ts         # Keyboard input handling
├── utils/
│   ├── constants.ts           # Game constants
│   └── helpers.ts             # Utility functions
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## 2. Data Models & TypeScript Types

### 2.1 Core Types (`types/game.types.ts`)
```typescript
// Track styles the player can choose
export type TrackStyle = 'city' | 'desert' | 'forest' | 'snow' | 'beach';

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
}

// Track configuration
export interface Track {
  style: TrackStyle;
  length: number;          // Total track length
  curves: CurveSection[];
  obstacles: Obstacle[];
  background: string;
  foreground: string;
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
  countdown: number;       // 3, 2, 1 countdown
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
  racerStandings: { name: string; position: number }[];
}
```

### 2.2 Storage Types (`types/storage.types.ts`)
```typescript
export interface StorageAdapter {
  initialize(): Promise<void>;
  saveGame(progress: GameProgress): Promise<void>;
  loadGame(): Promise<GameProgress | null>;
  saveSettings(settings: GameSettings): Promise<void>;
  loadSettings(): Promise<GameSettings | null>;
  clearAll(): Promise<void>;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

## 3. Storage Layer Implementation

### 3.1 Storage Manager (`storage/StorageManager.ts`)
- Singleton pattern to manage storage operations
- Auto-detect IndexedDB support and fallback to localStorage
- Provide unified interface for all storage operations
```typescript
class StorageManager {
  private adapter: StorageAdapter;
  
  async initialize() {
    if (this.isIndexedDBAvailable()) {
      this.adapter = new IndexedDBAdapter();
    } else {
      this.adapter = new LocalStorageAdapter();
    }
    await this.adapter.initialize();
  }
  
  private isIndexedDBAvailable(): boolean {
    return 'indexedDB' in window;
  }
}
```

### 3.2 IndexedDB Adapter (`storage/IndexedDBAdapter.ts`)
- Database name: 'RacingGameDB'
- Version: 1
- Object stores:
  - 'gameProgress': Store game state between rounds
  - 'settings': Store user preferences
  - 'leaderboard': Store best times and scores
- Use Promises for all operations
- Handle errors gracefully

### 3.3 LocalStorage Adapter (`storage/LocalStorageAdapter.ts`)
- Keys: 'racing_game_progress', 'racing_game_settings', 'racing_game_leaderboard'
- JSON serialize/deserialize all data
- Try-catch all operations (quota exceeded handling)

## 4. Game Engine Architecture

### 4.1 Game Loop (`game/GameEngine.ts`)
```typescript
class GameEngine {
  private animationFrameId: number;
  private lastFrameTime: number;
  private deltaTime: number;
  
  start() {
    this.lastFrameTime = performance.now();
    this.loop();
  }
  
  private loop = () => {
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = currentTime;
    
    this.update(this.deltaTime);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  private update(dt: number) {
    // Update all racers
    // Update AI decisions
    // Check collisions
    // Update positions
    // Check for lap completion
    // Check for race finish
  }
  
  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
}
```

### 4.2 Racer Physics (`game/RacerPhysics.ts`)
- **Acceleration**: Increase speed based on input (up to maxSpeed)
- **Deceleration**: Natural slowdown when not accelerating
- **Steering**: Change lanes (smooth transition over time)
- **Speed modifiers**: 
  - Curves reduce max speed
  - Obstacles cause slowdown/collision
- **Position calculation**: Update racer.position based on speed and deltaTime

```typescript
function updateRacer(racer: Racer, dt: number, input: PlayerInput): Racer {
  let newSpeed = racer.speed;
  let newLane = racer.lane;
  
  // Acceleration
  if (input.accelerate) {
    newSpeed = Math.min(racer.maxSpeed, racer.speed + racer.acceleration * dt);
  } else {
    newSpeed = Math.max(0, racer.speed - DECELERATION * dt);
  }
  
  // Steering
  if (input.left && racer.lane > 0) {
    newLane = Math.max(0, racer.lane - LANE_CHANGE_SPEED * dt);
  }
  if (input.right && racer.lane < 5) {
    newLane = Math.min(5, racer.lane + LANE_CHANGE_SPEED * dt);
  }
  
  // Position update
  const newPosition = racer.position + (newSpeed * dt) / TRACK_LENGTH;
  
  return { ...racer, speed: newSpeed, lane: newLane, position: newPosition };
}
```

### 4.3 AI Controller (`game/AIController.ts`)
- **5 difficulty levels**: Each bot has slightly different stats
- **Lane selection AI**:
  - Avoid obstacles ahead
  - Try to find clear path
  - Occasionally make mistakes (randomness)
- **Speed control**:
  - Accelerate when clear path
  - Slow down for curves and obstacles
- **Rubber-banding** (optional): Adjust AI difficulty based on player position

```typescript
class AIController {
  makeDecision(racer: Racer, track: Track, otherRacers: Racer[]): AIInput {
    const lookAheadDistance = 10; // Check obstacles ahead
    const obstacles = this.getObstaclesInRange(racer, track, lookAheadDistance);
    
    let shouldAccelerate = true;
    let targetLane = racer.lane;
    
    // Check for obstacles in current lane
    if (this.hasObstacleInLane(obstacles, racer.lane)) {
      shouldAccelerate = false;
      targetLane = this.findBestLane(obstacles);
    }
    
    // Add randomness for difficulty
    if (Math.random() < this.mistakeProbability) {
      shouldAccelerate = !shouldAccelerate;
    }
    
    return {
      accelerate: shouldAccelerate,
      targetLane: targetLane
    };
  }
}
```

### 4.4 Track Generator (`game/TrackGenerator.ts`)
- Generate track based on selected style
- Each style has:
  - Unique color scheme
  - Different curve patterns
  - Themed obstacles
  - Visual elements (background, decorations)

```typescript
function generateTrack(style: TrackStyle): Track {
  const templates = {
    city: {
      background: '#2c3e50',
      foreground: '#95a5a6',
      curvePattern: 'moderate',
      obstacles: ['car', 'cone', 'barrier']
    },
    desert: {
      background: '#f39c12',
      foreground: '#e67e22',
      curvePattern: 'gentle',
      obstacles: ['cactus', 'rock', 'tumbleweed']
    },
    // ... other styles
  };
  
  const config = templates[style];
  const curves = generateCurves(config.curvePattern);
  const obstacles = generateObstacles(config.obstacles, curves);
  
  return { style, curves, obstacles, ...config };
}
```

## 5. React Component Implementation

### 5.1 App Component (`App.tsx`)
- Manage overall game state machine:
  - 'menu' → 'track-select' → 'countdown' → 'racing' → 'results' → (repeat 3 times) → 'final-results'
- Provide GameContext for child components
- Handle storage initialization on mount

```typescript
function App() {
  const [gameState, setGameState] = useState<'menu' | 'track-select' | 'racing' | 'results' | 'final'>('menu');
  const [progress, setProgress] = useState<GameProgress>(initialProgress);
  
  useEffect(() => {
    StorageManager.initialize().then(() => {
      const saved = await StorageManager.loadGame();
      if (saved) setProgress(saved);
    });
  }, []);
  
  return (
    <GameContext.Provider value={{ progress, setProgress }}>
      {gameState === 'menu' && <GameMenu onStart={() => setGameState('track-select')} />}
      {gameState === 'track-select' && <TrackSelector onSelect={handleTrackSelect} />}
      {gameState === 'racing' && <RaceView onFinish={handleRaceFinish} />}
      {gameState === 'results' && <ResultsScreen onContinue={handleContinue} />}
      {gameState === 'final' && <Leaderboard onRestart={handleRestart} />}
    </GameContext.Provider>
  );
}
```

### 5.2 Track Selector (`components/TrackSelector.tsx`)
- Display 5 track options in a grid/carousel
- Each option shows:
  - Preview image/illustration
  - Track name
  - Brief description
- Animate selection
- Save choice and proceed to race

### 5.3 Race View (`components/RaceView.tsx`)
- Main game container
- Initialize GameEngine on mount
- Handle countdown (3, 2, 1, GO!)
- Render track, racers, and HUD
- Use useGameLoop hook for updates

```typescript
function RaceView({ onFinish }: RaceViewProps) {
  const [raceState, setRaceState] = useState<RaceState>(initialRaceState);
  const gameEngineRef = useRef<GameEngine>(null);
  
  useEffect(() => {
    gameEngineRef.current = new GameEngine(raceState, setRaceState);
    
    // Countdown
    startCountdown().then(() => {
      gameEngineRef.current.start();
    });
    
    return () => {
      gameEngineRef.current?.stop();
    };
  }, []);
  
  useEffect(() => {
    if (raceState.raceFinished) {
      onFinish(raceState);
    }
  }, [raceState.raceFinished]);
  
  return (
    <div className="race-container">
      <RaceTrack track={currentTrack} racers={raceState.racers} />
      <RaceHUD raceState={raceState} />
    </div>
  );
}
```

### 5.4 Race Track (`components/RaceTrack.tsx`)
- Pseudo-3D perspective view (2.5D)
- **Visual approach**:
  - Top-down or isometric perspective
  - Track scrolls/moves to show forward motion
  - 6 lanes visible
  - Racers rendered as cars/sprites
- Use CSS transforms for perspective effect
- Render curves by shifting lane positions
- Render obstacles as they approach

```typescript
function RaceTrack({ track, racers }: RaceTrackProps) {
  const playerRacer = racers.find(r => r.isPlayer);
  const trackOffset = playerRacer.position * -100; // Scroll based on player
  
  return (
    <div className="track-container" style={{ backgroundColor: track.background }}>
      <div className="track" style={{ transform: `translateY(${trackOffset}%)` }}>
        {/* Render track lanes */}
        <div className="lanes">
          {[0, 1, 2, 3, 4, 5].map(lane => (
            <div key={lane} className="lane" />
          ))}
        </div>
        
        {/* Render racers */}
        {racers.map(racer => (
          <Racer key={racer.id} racer={racer} />
        ))}
        
        {/* Render obstacles */}
        {track.obstacles.map((obstacle, i) => (
          <Obstacle key={i} obstacle={obstacle} />
        ))}
      </div>
    </div>
  );
}
```

### 5.5 Racer Component (`components/Racer.tsx`)
- Simple car sprite/shape
- Position based on racer.position and racer.lane
- Smooth transitions for lane changes
- Visual feedback for speed (motion blur, exhaust particles)
- Different colors for player vs AI

### 5.6 Race HUD (`components/RaceHUD.tsx`)
- Top bar showing:
  - Current position (1st, 2nd, etc.)
  - Current lap / Total laps
  - Race time
  - Speed indicator
  - Mini-map (optional)
- Position list (right side): Show all racer names and positions

### 5.7 Results Screen (`components/ResultsScreen.tsx`)
- Show round results:
  - "Round X Complete!"
  - Player's finishing position
  - Time taken
  - Full standings (all 6 racers)
- Points awarded based on position
- If round < 3: "Continue to Round X" button
- If round = 3: Proceed to final results
- Save progress to storage

### 5.8 Leaderboard (`components/Leaderboard.tsx`)
- Final game results after 3 rounds
- Show:
  - Total points across all rounds
  - Individual round breakdowns
  - Win/lose message
  - "Play Again" button
- Victory condition: Player must finish in top 3 overall

## 6. Input Handling

### 6.1 Keyboard Controls (`hooks/useKeyboard.ts`)
- Arrow Up / W: Accelerate
- Arrow Left / A: Move left
- Arrow Right / D: Move right
- Arrow Down / S: Brake (optional)
- Space: Boost (optional feature)

```typescript
function useKeyboard() {
  const [keys, setKeys] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return {
    accelerate: keys.has('ArrowUp') || keys.has('w'),
    left: keys.has('ArrowLeft') || keys.has('a'),
    right: keys.has('ArrowRight') || keys.has('d'),
    brake: keys.has('ArrowDown') || keys.has('s')
  };
}
```

## 7. Visual Design & Styling

### 7.1 Design Theme
- **Retro arcade** aesthetic with modern polish
- Bright, vibrant colors
- Smooth animations and transitions
- Pixel-perfect UI elements

### 7.2 Track Styles Visual Identity
- **City**: Dark gray roads, neon lights, skyscrapers silhouette
- **Desert**: Sandy yellow/orange, cacti, dunes, sun rays
- **Forest**: Green canopy, trees, dappled sunlight
- **Snow**: White/blue palette, pine trees, ice patches
- **Beach**: Blue sky, palm trees, ocean waves, sandy shores

### 7.3 CSS Architecture
- Use CSS modules or styled-components
- Tailwind utility classes for rapid development
- CSS custom properties for theme colors
- Animations:
  - Fade in/out for screens
  - Slide transitions
  - Bounce effects for buttons
  - Pulsing effects for countdown

### 7.4 Responsive Design
- Target desktop primarily (landscape)
- Minimum width: 1024px recommended
- Touch controls for mobile (optional enhancement)

## 8. Game Balance & Tuning

### 8.1 Race Parameters
```typescript
const GAME_CONSTANTS = {
  TOTAL_ROUNDS: 3,
  RACERS_PER_RACE: 6, // 1 player + 5 AI
  LAPS_PER_RACE: 3,
  TRACK_LENGTH: 1000, // arbitrary units
  
  // Player stats
  PLAYER_MAX_SPEED: 100,
  PLAYER_ACCELERATION: 50,
  
  // AI stats (varied)
  AI_MAX_SPEED_RANGE: [85, 105],
  AI_ACCELERATION_RANGE: [40, 55],
  AI_MISTAKE_PROBABILITY: 0.05,
  
  // Physics
  DECELERATION: 30,
  LANE_CHANGE_SPEED: 2, // lanes per second
  OBSTACLE_SLOWDOWN: 0.5, // multiply speed by this
  CURVE_SLOWDOWN: 0.8,
  
  // Scoring
  POINTS_BY_POSITION: [10, 8, 6, 4, 2, 0],
};
```

### 8.2 Difficulty Progression
- Round 1: AI slightly slower than player
- Round 2: AI matches player
- Round 3: AI slightly faster than player
- Adjust AI_MAX_SPEED_RANGE between rounds

### 8.3 Win Condition
- Player must accumulate enough points to be in top 3 overall
- Calculate total points across all 3 rounds
- Display final ranking

## 9. Polish & Juice

### 9.1 Visual Effects
- Screen shake on collision
- Particle effects (dust, sparks, exhaust)
- Speed lines when accelerating
- Checkpoint celebrations (lap completion)
- Victory confetti/fireworks

### 9.2 Audio (Optional, if time permits)
- Engine sounds (can use Web Audio API)
- Collision sounds
- UI button clicks
- Background music (different per track style)
- Victory/defeat sounds

### 9.3 Animations
- Smooth camera follow (ease player to center)
- Menu transitions (slide, fade)
- Countdown animation (scale + fade)
- Results screen: Stagger racer name reveals
- Victory screen: Trophy animation

## 10. Testing Checklist

### 10.1 Core Functionality
- [ ] Game starts from menu
- [ ] Track selection saves choice
- [ ] Race countdown works (3, 2, 1, GO)
- [ ] Player can control racer with keyboard
- [ ] AI racers move independently
- [ ] Lap counting works correctly
- [ ] Race finishes after 3 laps
- [ ] Results screen shows correct positions
- [ ] 3 rounds complete before final results
- [ ] Final results calculate winner correctly

### 10.2 Storage
- [ ] Game progress saves after each round
- [ ] Progress loads on page refresh
- [ ] Settings persist
- [ ] Fallback to localStorage works if IndexedDB unavailable
- [ ] Clear data works

### 10.3 Edge Cases
- [ ] Player finishes first in all rounds → Wins
- [ ] Player finishes last in all rounds → Loses
- [ ] Racer collision detection works
- [ ] Obstacle avoidance works
- [ ] Lane boundaries enforced
- [ ] Keyboard input lag minimal
- [ ] Game loop performance (60fps target)

### 10.4 Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

## 11. Implementation Order (Step-by-Step)

### Phase 1: Foundation (MVP)
1. Set up Vite + React + TypeScript project
2. Create type definitions
3. Build storage layer (IndexedDB + localStorage)
4. Create basic game state management
5. Implement GameEngine skeleton with game loop

### Phase 2: Core Gameplay
6. Implement racer physics (movement, acceleration)
7. Create AI controller (basic behavior)
8. Build track generator (simple straight track first)
9. Implement keyboard controls
10. Create basic race view with moving racers

### Phase 3: UI Components
11. Build main menu
12. Create track selector
13. Implement race HUD
14. Create results screen
15. Build final leaderboard

### Phase 4: Game Loop Integration
16. Integrate countdown system
17. Implement lap counting
18. Add position tracking
19. Connect race finish to results screen
20. Implement multi-round progression

### Phase 5: Visual Polish
21. Style all components (Tailwind + custom CSS)
22. Add track style themes
23. Implement animations and transitions
24. Add visual effects (particles, speed lines)
25. Create responsive layouts

### Phase 6: Tuning & Testing
26. Balance AI difficulty
27. Test all game flows
28. Fix bugs and edge cases
29. Optimize performance
30. Final polish and deployment prep

## 12. Deployment Considerations

### 12.1 Build Configuration
- Vite production build
- Optimize assets (images, fonts)
- Enable compression
- Set correct base path for hosting

### 12.2 Static Hosting
- Works with: GitHub Pages, Netlify, Vercel, Cloudflare Pages
- All game state in browser storage (no backend needed)
- SPA routing considerations (hash router or fallback)

### 12.3 Performance
- Target: 60fps game loop
- Use requestAnimationFrame efficiently
- Minimize re-renders (React.memo, useMemo)
- Lazy load assets if needed
- Keep bundle size < 500KB

## 13. Bonus Features (Time Permitting)

1. **Power-ups**: Speed boost, shield, shortcuts
2. **More track styles**: Space, underwater, volcano
3. **Customization**: Player car colors, names
4. **Time trials**: Race against your best time
5. **Multiplayer**: Local split-screen (2 players)
6. **Achievements**: Unlock badges for milestones
7. **Sound effects**: Full audio implementation
8. **Mobile support**: Touch controls
9. **Replay system**: Watch race replays
10. **Advanced AI**: More sophisticated behavior patterns

---

## Summary

This plan provides a complete roadmap for building a racing game with:
- ✅ 3 rounds of racing
- ✅ 5 AI opponents per round
- ✅ Player choice of 5 track styles
- ✅ Full browser storage (IndexedDB + localStorage)
- ✅ React + TypeScript + Vite architecture
- ✅ Static deployment ready

The implementation is structured to be modular, testable, and maintainable, with clear separation of concerns between game logic, rendering, and storage layers.