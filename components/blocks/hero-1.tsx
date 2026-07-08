import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero1() {
  return (
    <section className="w-full flex items-start lg:items-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <div className="hero-fade-up flex items-center gap-3 w-fit">
              <span className="inline-flex items-center px-3 py-1 bg-foreground text-background text-[10px] tracking-[0.24em] uppercase">
                New Arrivals
              </span>
              <span className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground">
                The Summer &rsquo;26 Edit
              </span>
            </div>

            <h1 className="hero-fade-up hero-delay-1 font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] tracking-tight leading-[1.02] text-foreground">
              Summer,
              <br />
              <em className="italic font-light">Elevated.</em>
            </h1>

            <p className="hero-fade-up hero-delay-2 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Silk dresses, elevated essentials, and gold vermeil jewelry —
              curated in limited runs for women who dress with intention.
              New pieces land weekly, and the best sell out first.
            </p>

            <div className="hero-fade-up hero-delay-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Link
                href="/shop/new-arrivals"
                className="relative overflow-hidden flex items-center justify-center px-8 py-3.5 bg-foreground text-background text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/85 transition-colors w-full sm:w-auto"
              >
                Explore Summer Collection
              </Link>
              <Link
                href="/shop/sale"
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-foreground/20 text-[11px] tracking-[0.22em] uppercase hover:bg-foreground/5 transition-colors w-full sm:w-auto group"
              >
                Shop the Sale
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="hero-fade-up hero-delay-4 flex items-center gap-4 pt-2 sm:pt-4">
              <div className="h-px w-12 bg-foreground/30 shrink-0" aria-hidden />
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                Free shipping over $200 · Secure checkout · 14-day easy returns
              </p>
            </div>
          </div>

          <div className="hero-fade-up hero-delay-2 relative w-full h-auto">
            <div className="relative w-full min-h-[420px] sm:min-h-[560px] lg:min-h-[640px] bg-muted overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop"
                alt="Summer, Elevated — the Sandryne Summer '26 collection"
                fill
                loading="lazy"
                sizes="100vw"
                quality={80}
                className="object-cover lg:hidden"
              />
              <Image
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop"
                alt="Summer, Elevated — the Sandryne Summer '26 collection"
                fill
                priority
                fetchPriority="high"
                sizes="50vw"
                quality={80}
                className="object-cover hidden lg:block"
              />

              <div className="absolute bottom-0 right-0 flex flex-col items-end">
                <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
                    aria-hidden
                  >
                    <path d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z" className="fill-background" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
