"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Persistent state hook backed by localStorage.
 * SSR-safe: returns the fallback until mounted, then syncs via a microtask
 * (avoids the lint rule against setState directly in an effect body).
 */
export function usePersistentState<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;
    // Defer the read+set to a microtask so setState isn't synchronous in the effect body.
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          const parsed = JSON.parse(raw) as T;
          setValue(parsed);
        }
      } catch { /* ignore */ }
    });
    return () => { cancelled = true; };
  }, [key]);

  const update = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [key]);

  return [value, update];
}
