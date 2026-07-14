"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  /** Extra delay before the reveal starts, in seconds. */
  delay?: number;
}

/**
 * Editorial line-mask reveal: text slides up from behind an overflow clip the
 * first time it enters the viewport.
 *
 * CSS-first: the hidden state and the transition live in globals.css, gated
 * on `html[data-js]` (set by the inline <head> script before first paint).
 * This component only toggles a class when the text scrolls into view. That
 * keeps the server HTML free of inline transforms, so no-JS visitors,
 * crawlers, and reduced-motion users always see the text plainly. The clip
 * wrapper reserves the exact same box as the text, so CLS is zero.
 */
export default function RevealText({
  children,
  className,
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <span ref={ref} className={cn("block overflow-hidden", className)}>
      <span
        className={cn("reveal-text-inner block", inView && "is-revealed")}
        style={delay ? { transitionDelay: `${delay}s` } : undefined}
      >
        {children}
      </span>
    </span>
  );
}
