"use client";

import { useHashSync } from "@/lib/use-hash-sync";

/**
 * Client wrapper that activates the URL-hash-sync hook.
 * Rendered once inside the server page so the hook runs on the client.
 */
export function HashSync() {
  useHashSync();
  return null;
}
