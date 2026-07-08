"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import BlurHighlight from "@/components/react-bits/blur-highlight";

export function Hero1() {
  return (
    <section className="w-full flex items-start lg:items-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left column — editorial copy */}
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 w-fit"
            >
              <span className="inline-flex items-center px-3 py-1 bg-foreground text-background text-[10px] tracking-[0.24em] uppercase">
                New Arrivals
              </span>
              <span className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">
                The Summer &rsquo;26 Edit
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] tracking-tight leading-[1.02] text-foreground"
            >
              Summer,
              <br />
              <em className="italic font-light">Elevated.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              Silk dresses, elevated essentials, and gold vermeil jewelry —
              curated in limited runs for women who dress with intention.
              New pieces land weekly, and the best sell out first.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
            >
              <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/shop/new-arrivals"
                  className="relative overflow-hidden flex items-center justify-center px-8 py-3.5 bg-foreground text-background text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/85 transition-colors w-full sm:w-auto"
                >
                  <motion.span
                    aria-hidden
                    initial={{ x: "-150%" }}
                    animate={{ x: "150%" }}
                    transition={{
                      duration: 1.6,
                      delay: 1.2,
                      repeat: Infinity,
                      repeatDelay: 6,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-background/25 to-transparent skew-x-[-20deg]"
                  />
                  Explore Summer Collection
                </Link>
              </motion.span>
              <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  href="/shop/sale"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 border border-foreground/20 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/5 transition-colors w-full sm:w-auto group"
                >
                  Shop the Sale
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-4 pt-2 sm:pt-4 select-none"
            >
              <div className="h-px w-12 bg-foreground/30 shrink-0" />
              <BlurHighlight
                className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground"
                blurAmount={5}
                blurDelay={0.6}
                viewportOptions={{ once: true, amount: 0.4 }}
              >
                Free shipping over $200 · Secure checkout · 14-day easy returns
              </BlurHighlight>
            </motion.div>
          </div>

          {/* Right column — editorial imagery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative w-full h-auto"
          >
            <div className="relative w-full min-h-[420px] sm:min-h-[560px] lg:min-h-[640px] bg-muted overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1740&auto=format&fit=crop"
                alt="Summer, Elevated — the Sandryne Summer '26 collection"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Corner action */}
              <div className="absolute bottom-0 right-0 flex flex-col items-end">
                <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z" className="fill-background" />
                </svg>
                <div className="relative">
                  <div className="w-24 h-24 bg-background pl-4 pt-4">
                    <Link
                      href="/shop/dresses"
                      aria-label="Shop dresses"
                      className="w-full h-full flex items-center justify-center bg-foreground hover:opacity-90 transition-opacity"
                    >
                      <ArrowRight className="w-6 h-6 text-background -rotate-45" />
                    </Link>
                  </div>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute bottom-0 -left-10"
                  >
                    <path d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z" className="fill-background" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
