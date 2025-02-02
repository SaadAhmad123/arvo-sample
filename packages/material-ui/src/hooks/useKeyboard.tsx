import React, { useEffect } from 'react';

interface IUseKeyboard {
  condition: (event: KeyboardEvent) => boolean;
  action: () => void;
}

/**
 * Custom hook for listening to keyboard events.
 *
 * @param param.condition - A function that takes a KeyboardEvent and returns a boolean value. The hook will only execute the action if this function returns true.
 * @param param.action - A function to be executed when the condition is met.
 */
export const useKeyboard = ({ condition, action }: IUseKeyboard) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (condition(event)) action();
    };
    window?.addEventListener('keydown', listener);
    return () => {
      window?.removeEventListener('keydown', listener);
    };
  }, [condition, action]);
};
