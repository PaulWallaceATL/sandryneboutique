"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR/first paint and true after hydration.
 * Used to defer rendering of localStorage-backed state (e.g. the cart).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
