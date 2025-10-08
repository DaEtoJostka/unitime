import { useState, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  onError?: (error: Error) => void;
}

export function useLocalStorage<T>({
  key,
  defaultValue,
  onError
}: UseLocalStorageOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      onError?.(error as Error);
      return defaultValue;
    }
  });

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        onError?.(error as Error);
      }
      
      return valueToStore;
    });
  }, [key, onError]);

  return [value, updateValue] as const;
}

