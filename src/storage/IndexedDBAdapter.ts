import { StorageAdapter, GameSettings } from '../types/storage.types';
import { GameProgress } from '../types/game.types';

const DB_NAME = 'RacingGameDB';
const DB_VERSION = 1;
const STORE_PROGRESS = 'gameProgress';
const STORE_SETTINGS = 'settings';

export class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          db.createObjectStore(STORE_PROGRESS);
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS);
        }
      };
    });
  }

  async saveGame(progress: GameProgress): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PROGRESS], 'readwrite');
      const store = transaction.objectStore(STORE_PROGRESS);
      const request = store.put(progress, 'current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save game progress'));
    });
  }

  async loadGame(): Promise<GameProgress | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PROGRESS], 'readonly');
      const store = transaction.objectStore(STORE_PROGRESS);
      const request = store.get('current');

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to load game progress'));
    });
  }

  async saveSettings(settings: GameSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.put(settings, 'current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save settings'));
    });
  }

  async loadSettings(): Promise<GameSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SETTINGS], 'readonly');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.get('current');

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to load settings'));
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PROGRESS, STORE_SETTINGS], 'readwrite');

      const progressStore = transaction.objectStore(STORE_PROGRESS);
      const settingsStore = transaction.objectStore(STORE_SETTINGS);

      progressStore.clear();
      settingsStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to clear data'));
    });
  }
}
