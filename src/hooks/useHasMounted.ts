import { useEffect, useState } from 'react';

// Zustand's `persist` middleware reads localStorage, which doesn't exist during SSR — the
// server always renders the store's DEFAULT state, then the client "rehydrates" from
// localStorage after mount. If a component reads persisted state (e.g. cart item count)
// directly on first render, the server-rendered HTML (default state) and the client's very
// first render (already-hydrated real state) can disagree, and React throws a hydration
// mismatch warning. This hook returns false on the server AND on the client's first render
// (matching the server exactly), then flips true one tick later via useEffect — any UI
// gated on it renders the same "empty" state as the server until then.
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  return hasMounted;
}