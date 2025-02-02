import React from 'react';

/**
 * Custom React hook that memoizes the result of a function. It executes the provided function
 * and returns its result, memoizing the value. If the function throws an error, `undefined` is returned.
 * This hook is useful for expensive calculations or operations that you want to memoize,
 * with added error handling.
 *
 * @template T The type of the value that the function returns.
 * @param fn A function that returns a value of type T. This function is executed and its result is memoized.
 * @param dependencies An array of dependencies. The function `fn` will be re-executed and memoized if the dependencies change.
 * @returns The memoized value returned by `fn`, or `undefined` if an error occurs during the execution of `fn`.
 */
export const useTryMemo = <T = undefined>(fn: () => T, dependencies: unknown[]): T | undefined => {
  return React.useMemo(() => {
    try {
      return fn();
    } catch {
      return undefined;
    }
  }, [fn, ...dependencies]);
};
