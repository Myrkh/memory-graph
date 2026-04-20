import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ephemeral value that auto-clears after `durationMs`. Calling `trigger`
 * replaces the value and restarts the timer; unmount clears the pending
 * timeout. Used for flash highlights and toast messages where the visual
 * effect lives for a fixed window then fades.
 */
export function useTimedValue<T>(
  durationMs: number,
): [T | null, (next: T) => void] {
  const [value, setValue] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(
    (next: T) => {
      setValue(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setValue(null), durationMs);
    },
    [durationMs],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return [value, trigger];
}
