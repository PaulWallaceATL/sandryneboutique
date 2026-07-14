"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, select, textarea, label, summary";

const DOT_SIZE = 6;
const RING_SIZE = 34;
const RING_HOVER_SCALE = 1.7;

/**
 * Minimalist glass cursor: a small dot that tracks the pointer exactly plus a
 * trailing frosted-glass ring on springs. The ring expands over interactive
 * elements (detected with a single delegated pointerover listener). Purely
 * additive — the native cursor stays visible.
 *
 * Only mounted on fine-pointer, motion-safe devices (see FlareEffects).
 */
export default function GlassCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 400, damping: 40, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 400, damping: 40, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setVisible(true);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      setHovering(target.closest(INTERACTIVE_SELECTOR) !== null);
    };

    const onLeaveWindow = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener(
        "pointerleave",
        onLeaveWindow,
      );
    };
  }, [dotX, dotY]);

  return (
    <div aria-hidden className="hidden lg:block">
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[110] rounded-full bg-foreground mix-blend-difference"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[110] rounded-full border border-foreground/30 bg-foreground/[0.04] backdrop-blur-[2px]"
        style={{
          width: RING_SIZE,
          height: RING_SIZE,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? RING_HOVER_SCALE : 1,
        }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      />
    </div>
  );
}
