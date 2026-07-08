"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  /** Reserved height to avoid layout shift before content loads */
  minHeight?: string;
  /** Load content this many px before it enters the viewport */
  rootMargin?: string;
}

/** Defers rendering children until the section is near the viewport. */
export function LazySection({
  children,
  className,
  minHeight = "0px",
  rootMargin = "240px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={cn(className)} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  );
}
