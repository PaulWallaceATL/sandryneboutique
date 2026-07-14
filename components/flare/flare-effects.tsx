"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ssr: false keeps the cursor (and motion's spring machinery) entirely out of
// the server payload and initial hydration work.
const GlassCursor = dynamic(
  () => import("@/components/react-bits/glass-cursor"),
  { ssr: false },
);

const CURSOR_QUERY =
  "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)";

/**
 * Client-only flare effects for the storefront. Each effect is dynamically
 * imported and gated behind capability media queries so touch devices and
 * motion-sensitive users pay zero cost.
 */
export function FlareEffects() {
  const [cursorEnabled, setCursorEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(CURSOR_QUERY);
    const update = () => setCursorEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return cursorEnabled ? <GlassCursor /> : null;
}
