"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-3/4 bg-muted" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} — view ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1} of ${name}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-16 h-20 sm:w-20 sm:h-26 overflow-hidden bg-muted transition-opacity",
                i === activeIndex
                  ? "ring-1 ring-foreground ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
