import { useState, useEffect } from 'react';
import { GameProgress } from '../types/game.types';
import { GameSettings } from '../types/storage.types';
import { StorageManager } from '../storage/StorageManager';

export function useStorage() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    StorageManager.initialize()
      .then(() => setInitialized(true))
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
        setError(err.message);
      });
  }, []);

  const saveGame = async (progress: GameProgress): Promise<void> => {
    try {
      await StorageManager.saveGame(progress);
    } catch (err) {
      console.error('Failed to save game:', err);
      throw err;
    }
  };

  const loadGame = async (): Promise<GameProgress | null> => {
    try {
      return await StorageManager.loadGame();
    } catch (err) {
      console.error('Failed to load game:', err);
      return null;
    }
  };

  const saveSettings = async (settings: GameSettings): Promise<void> => {
    try {
      await StorageManager.saveSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      throw err;
    }
  };

  const loadSettings = async (): Promise<GameSettings | null> => {
    try {
      return await StorageManager.loadSettings();
    } catch (err) {
      console.error('Failed to load settings:', err);
      return null;
    }
  };

  const clearAll = async (): Promise<void> => {
    try {
      await StorageManager.clearAll();
    } catch (err) {
      console.error('Failed to clear data:', err);
      throw err;
    }
  };

  return {
    initialized,
    error,
    saveGame,
    loadGame,
    saveSettings,
    loadSettings,
    clearAll,
  };
}
