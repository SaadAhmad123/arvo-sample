import { useEffect } from 'react';

/**
 * This hook runs only when the component is unmounted
 */
export const useUnmount = (callback: () => void) => {
  useEffect(() => {
    return callback;
  }, [callback]);
};
