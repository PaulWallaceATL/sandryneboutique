import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero1 } from "@/components/blocks/hero-1";
import { TaglineMarquee } from "@/components/home/tagline-marquee";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { ProductCard } from "@/components/product/product-card";
import RevealText from "@/components/react-bits/reveal-text";
import { LazySection } from "@/components/ui/lazy-section";
import { getProducts } from "@/lib/data/products";

const ArrivalsCarousel = dynamic(
  () =>
    import("@/components/home/arrivals-carousel").then((m) => ({
      default: m.ArrivalsCarousel,
    })),
  {
    loading: () => (
      <section
        className="py-20 sm:py-28 border-y border-foreground/8 bg-card"
        aria-hidden
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-[440px] sm:h-[540px] bg-muted/30 animate-pulse" />
      </section>
    ),
  },
);

const BrandSection = dynamic(
  () =>
    import("@/components/home/brand-section").then((m) => ({
      default: m.BrandSection,
    })),
  {
    loading: () => (
      <section className="bg-foreground min-h-[480px]" aria-hidden />
    ),
  },
);

export const metadata: Metadata = {
  title: {
    absolute:
      "Sandryne Boutique — Curated Luxury Women's Fashion | Dresses, Tops & Jewelry",
  },
  description:
    "Shop curated luxury women's fashion at Sandryne Boutique: silk dresses, elevated tops and bottoms, active wear, and gold vermeil jewelry. Free shipping over $200, easy returns, and 10% off your first order.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sandryne Boutique — Curated Luxury Women's Fashion",
    description:
      "Timeless silhouettes and modern minimalism — dresses, tops, bottoms, active wear, accessories and jewelry, curated for an effortless, elevated look.",
    url: "/",
  },
};

export default async function HomePage() {
  const [newArrivals, freshPicks] = await Promise.all([
    getProducts({ isNew: true, limit: 8 }),
    getProducts({ sort: "newest", limit: 8 }),
  ]);

  return (
    <>
      <Hero1 />
      <TaglineMarquee />
      <CategoryShowcase />

      <LazySection minHeight="540px" rootMargin="80px" className="below-fold-section">
        <ArrivalsCarousel products={freshPicks} />
      </LazySection>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
              Just In
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
              <RevealText>
                New <em className="italic font-light">Arrivals</em>
              </RevealText>
            </h2>
          </div>
          <Link
            href="/shop/new-arrivals"
            className="group flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase hover:opacity-60 transition-opacity"
          >
            Explore all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <LazySection minHeight="480px" rootMargin="80px">
        <BrandSection />
      </LazySection>
    </>
  );
}
