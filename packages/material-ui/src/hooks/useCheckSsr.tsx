import { useEffect, useState } from 'react';

export const useCheckSsr = () => {
  const [isSsr, setIsSsr] = useState(true);
  useEffect(() => {
    try {
      setIsSsr(typeof window === 'undefined');
    } catch {
      setIsSsr(true);
    }
  }, []);
  return isSsr;
};
