"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Magnetic from "@/components/react-bits/magnetic";
import RevealText from "@/components/react-bits/reveal-text";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArrivalsCarouselProps {
  products: Product[];
}

export function ArrivalsCarousel({ products }: ArrivalsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const active = products[activeIndex];

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);

    const cards = el.querySelectorAll<HTMLElement>("[data-carousel-item]");
    if (cards.length === 0) return;

    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelectorAll<HTMLElement>("[data-carousel-item]")[index];
    if (!card) return;

    const targetLeft =
      card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;

    el.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }, []);

  const scrollPrev = () => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  };

  const scrollNext = () => {
    scrollToIndex(Math.min(products.length - 1, activeIndex + 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length, updateScrollState]);

  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 border-y border-foreground/8 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
            This Week&rsquo;s
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
            <RevealText>
              Fresh <em className="italic font-light">Summer</em> Picks
            </RevealText>
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

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04),transparent_70%)]"
          aria-hidden
        />

        <div className="absolute left-2 sm:left-4 top-1/2 z-10 -translate-y-1/2">
          <Magnetic maxOffset={5}>
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Show previous pick"
              className={cn(
                "flex size-10 sm:size-11 items-center justify-center",
                "border border-foreground/15 bg-background/90 backdrop-blur-sm shadow-sm",
                "transition-opacity hover:bg-background disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
            </button>
          </Magnetic>
        </div>

        <div className="absolute right-2 sm:right-4 top-1/2 z-10 -translate-y-1/2">
          <Magnetic maxOffset={5}>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollRight}
              aria-label="Show next pick"
              className={cn(
                "flex size-10 sm:size-11 items-center justify-center",
                "border border-foreground/15 bg-background/90 backdrop-blur-sm shadow-sm",
                "transition-opacity hover:bg-background disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </button>
          </Magnetic>
        </div>

        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden py-2",
            "snap-x snap-mandatory scroll-smooth",
            "overscroll-x-contain touch-pan-x",
            "px-[calc(50%-36vw)] sm:px-[calc(50%-140px)] md:px-[calc(50%-150px)]",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {products.map((product, index) => {
            const isActive = index === activeIndex;
            const hasHoverImage = product.images.length > 1;

            return (
              <article
                key={product.id}
                data-carousel-item
                className={cn(
                  "snap-center shrink-0 w-[72vw] sm:w-[280px] md:w-[300px]",
                  "transition-[transform,opacity] duration-300 ease-out",
                  isActive ? "scale-100 opacity-100" : "scale-[0.94] opacity-65",
                )}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-3xl sm:rounded-4xl bg-muted shadow-lg border border-foreground/5">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 640px) 72vw, 300px"
                        className={cn(
                          "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]",
                          hasHoverImage && "group-hover:opacity-0",
                        )}
                      />
                    )}
                    {hasHoverImage && (
                      <Image
                        src={product.images[1]}
                        alt={`${product.name} — alternate view`}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 72vw, 300px"
                        className="object-cover opacity-0 scale-[1.03] transition-all duration-700 ease-out group-hover:opacity-100"
                      />
                    )}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-8 min-h-[4.5rem] flex justify-center">
        {active && (
          <div className="text-center animate-in fade-in duration-200">
            <Link href={`/products/${active.slug}`} className="group inline-block">
              <h3 className="font-serif text-xl sm:text-2xl tracking-wide group-hover:opacity-60 transition-opacity">
                {active.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {formatPrice(effectivePrice(active))}
              </p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
