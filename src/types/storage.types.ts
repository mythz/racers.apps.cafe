import { GameProgress } from './game.types';

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
