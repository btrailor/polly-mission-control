"use client";

import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval?: number; // ms, default 30000 (30s)
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
) {
  const { interval = 30000, enabled = true, onError } = options;
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const tick = useCallback(async () => {
    try {
      await savedCallback.current();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [onError]);

  // Set up interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial call
    tick();

    // Set up interval
    intervalRef.current = setInterval(tick, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled, tick]);

  // Return control functions
  const refresh = useCallback(() => {
    tick();
  }, [tick]);

  return { refresh };
}
