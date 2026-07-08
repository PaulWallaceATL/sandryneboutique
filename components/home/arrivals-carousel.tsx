"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import GradientCarousel from "@/components/react-bits/gradient-carousel";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/types";

interface ArrivalsCarouselProps {
  products: Product[];
}

export function ArrivalsCarousel({ products }: ArrivalsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = products[activeIndex];

  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 border-y border-foreground/8 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
            This Week&rsquo;s
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
            Fresh <em className="italic font-light">Summer</em> Picks
          </h2>
        </div>
        <Link
          href="/shop/new-arrivals"
          className="group flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase hover:opacity-60 transition-opacity"
        >
          View all new arrivals
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative h-[440px] sm:h-[540px]">
        <GradientCarousel
          images={products.map((p) => p.images[0])}
          imageAlts={products.map((p) => p.name)}
          onCardChange={setActiveIndex}
          cardAspectRatio={3 / 4}
          gradientIntensity={0.35}
          gradientSize={0.55}
          backgroundBlur={48}
          className="bg-card dark:bg-card"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-8 flex justify-center">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <Link href={`/products/${active.slug}`} className="group inline-block">
                <h3 className="font-serif text-xl sm:text-2xl tracking-wide group-hover:opacity-60 transition-opacity">
                  {active.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {formatPrice(effectivePrice(active))}
                </p>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
