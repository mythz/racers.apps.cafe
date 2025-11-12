import { useState, useEffect } from 'react';
import { PlayerInput } from '../types/game.types';

export function useKeyboard(): PlayerInput {
  const [keys, setKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const next = new Set(prev);
        next.add(e.key.toLowerCase());
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
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
    accelerate: keys.has('arrowup') || keys.has('w'),
    left: keys.has('arrowleft') || keys.has('a'),
    right: keys.has('arrowright') || keys.has('d'),
    brake: keys.has('arrowdown') || keys.has('s'),
  };
}
