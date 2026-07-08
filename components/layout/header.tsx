"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { cartCount, useCart } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.openCart);
  const hydrated = useHydrated();

  // Cart is persisted in localStorage; defer count to after hydration.
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="bg-foreground text-background text-center text-[11px] tracking-[0.2em] uppercase py-2 px-4">
        New customers save 10% with code NEW10 — Free shipping over $200
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-shadow duration-300 glass",
          scrolled && "shadow-[0_1px_24px_rgba(0,0,0,0.06)]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-3 items-center h-16">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden p-2 -ml-2"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>

            <Link
              href="/"
              className="justify-self-center font-serif text-2xl sm:text-3xl tracking-[0.28em] uppercase whitespace-nowrap"
            >
              Sandryne
            </Link>

            <div className="justify-self-end flex items-center gap-1 sm:gap-3">
              <Link href="/account" aria-label="Account" className="p-2 hover:opacity-60 transition-opacity">
                <User className="size-5" strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                aria-label="Open cart"
                onClick={openCart}
                className="relative p-2 hover:opacity-60 transition-opacity"
              >
                <ShoppingBag className="size-5" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-foreground text-background text-[10px] tabular-nums">
                    {count > 99 ? "99" : count}
                  </span>
                )}
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-8 pb-3.5">
            {CATEGORIES.map((cat) => {
              const href = `/shop/${cat.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={cn(
                    "relative text-[11px] tracking-[0.18em] uppercase transition-opacity hover:opacity-100",
                    active ? "opacity-100" : "opacity-60",
                    cat.slug === "sale" && "text-destructive opacity-90"
                  )}
                >
                  {cat.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-foreground"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden overflow-hidden border-t border-foreground/8"
            >
              <ul className="px-6 py-6 flex flex-col gap-1">
                {CATEGORIES.map((cat, i) => (
                  <motion.li
                    key={cat.slug}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <Link
                      href={`/shop/${cat.slug}`}
                      onClick={closeMenu}
                      className={cn(
                        "block py-2.5 font-serif text-2xl tracking-wide",
                        cat.slug === "sale" && "text-destructive"
                      )}
                    >
                      {cat.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
