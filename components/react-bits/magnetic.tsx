"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  /** Maximum translation toward the pointer, in pixels. */
  maxOffset?: number;
  /** How strongly the element leans toward the pointer (0–1). */
  strength?: number;
  className?: string;
}

/**
 * Wraps a CTA so it subtly leans toward the pointer and springs back on
 * leave. Transform-only and mouse-only: touch and pen pointers are ignored,
 * so the wrapper is inert on mobile.
 */
export default function Magnetic({
  children,
  maxOffset = 6,
  strength = 0.25,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const deltaX = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const deltaY = (e.clientY - (rect.top + rect.height / 2)) * strength;
    x.set(Math.max(-maxOffset, Math.min(maxOffset, deltaX)));
    y.set(Math.max(-maxOffset, Math.min(maxOffset, deltaY)));
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: springX, y: springY }}
      className={cn("motion-reduce:transform-none!", className)}
    >
      {children}
    </motion.div>
  );
}
