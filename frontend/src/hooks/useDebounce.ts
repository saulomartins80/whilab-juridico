// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = globalThis.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      globalThis.clearTimeout?.(handler as unknown as number);
    };
  }, [value, delay]);

  return debouncedValue;
}