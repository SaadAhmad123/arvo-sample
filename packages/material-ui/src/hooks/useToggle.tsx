import { useState } from 'react';

export const useToggle = (
  defaultValue = false,
): [boolean, () => void, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [state, setState] = useState<boolean>(defaultValue);
  const toggleState = () => {
    setState((prevState: boolean) => !prevState);
  };
  return [state, toggleState, setState];
};
