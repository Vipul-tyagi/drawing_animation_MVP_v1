import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const light = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(10);
    }
  }, [isSupported]);

  const medium = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(20);
    }
  }, [isSupported]);

  const heavy = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([30, 10, 30]);
    }
  }, [isSupported]);

  const success = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([10, 5, 10]);
    }
  }, [isSupported]);

  const error = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([50, 10, 50, 10, 50]);
    }
  }, [isSupported]);

  return {
    light,
    medium,
    heavy,
    success,
    error,
    isSupported,
  };
};