import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useReactiveRef } from './useReactiveRef';

export const useLocalStorageReactiveState = <T>(
  key: string,
  initialValue: T,
  onChange?: (newValue?: T, oldValue?: T) => void,
) => {
  const localStore = useLocalStorage<T>(key);
  const [state, setState] = useState<T>(initialValue);
  const initialLoad = useRef<boolean>(false);

  const stateReactiveRef = useReactiveRef<T>(initialValue, (newVal, oldVal) => {
    if (!initialLoad.current) return;
    setState(newVal);
    localStore.set(newVal);
    onChange?.(newVal, oldVal);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is by design. The hook must be called only on initial load change
  useEffect(() => {
    if (initialLoad.current) return;
    setState(localStore.get() || initialValue);
    initialLoad.current = true;
  }, [initialLoad]);

  return {
    state,
    get: stateReactiveRef.get,
    set: stateReactiveRef.set,
  };
};
