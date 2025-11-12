import { StorageAdapter, GameSettings } from '../types/storage.types';
import { GameProgress } from '../types/game.types';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

class StorageManagerClass {
  private adapter: StorageAdapter | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.isIndexedDBAvailable()) {
        this.adapter = new IndexedDBAdapter();
        await this.adapter.initialize();
        console.log('Using IndexedDB for storage');
      } else {
        throw new Error('IndexedDB not available');
      }
    } catch (e) {
      console.warn('IndexedDB initialization failed, falling back to localStorage:', e);
      this.adapter = new LocalStorageAdapter();
      await this.adapter.initialize();
      console.log('Using localStorage for storage');
    }

    this.initialized = true;
  }

  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  async saveGame(progress: GameProgress): Promise<void> {
    if (!this.adapter) throw new Error('Storage not initialized');
    return this.adapter.saveGame(progress);
  }

  async loadGame(): Promise<GameProgress | null> {
    if (!this.adapter) throw new Error('Storage not initialized');
    return this.adapter.loadGame();
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    if (!this.adapter) throw new Error('Storage not initialized');
    return this.adapter.saveSettings(settings);
  }

  async loadSettings(): Promise<GameSettings | null> {
    if (!this.adapter) throw new Error('Storage not initialized');
    return this.adapter.loadSettings();
  }

  async clearAll(): Promise<void> {
    if (!this.adapter) throw new Error('Storage not initialized');
    return this.adapter.clearAll();
  }

  getDefaultSettings(): GameSettings {
    return {
      soundEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.7,
      difficulty: 'medium',
    };
  }
}

// Export singleton instance
export const StorageManager = new StorageManagerClass();
