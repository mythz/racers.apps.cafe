import { StorageAdapter, GameSettings } from '../types/storage.types';
import { GameProgress } from '../types/game.types';

const KEY_PROGRESS = 'racing_game_progress';
const KEY_SETTINGS = 'racing_game_settings';

export class LocalStorageAdapter implements StorageAdapter {
  async initialize(): Promise<void> {
    // Check if localStorage is available
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
    } catch (e) {
      throw new Error('localStorage is not available');
    }
  }

  async saveGame(progress: GameProgress): Promise<void> {
    try {
      const serialized = JSON.stringify(progress);
      localStorage.setItem(KEY_PROGRESS, serialized);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error('Failed to save game progress');
    }
  }

  async loadGame(): Promise<GameProgress | null> {
    try {
      const serialized = localStorage.getItem(KEY_PROGRESS);
      if (!serialized) return null;
      return JSON.parse(serialized) as GameProgress;
    } catch (e) {
      console.error('Failed to load game progress:', e);
      return null;
    }
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(KEY_SETTINGS, serialized);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error('Failed to save settings');
    }
  }

  async loadSettings(): Promise<GameSettings | null> {
    try {
      const serialized = localStorage.getItem(KEY_SETTINGS);
      if (!serialized) return null;
      return JSON.parse(serialized) as GameSettings;
    } catch (e) {
      console.error('Failed to load settings:', e);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(KEY_PROGRESS);
      localStorage.removeItem(KEY_SETTINGS);
    } catch (e) {
      throw new Error('Failed to clear data');
    }
  }
}
