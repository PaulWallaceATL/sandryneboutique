import Link from "next/link";
import { CATEGORIES, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { NewsletterFormLazy } from "@/components/layout/newsletter-form-lazy";
import { InstagramIcon, TikTokIcon } from "@/components/icons/social";

const POLICY_LINKS = [
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns & Exchanges" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="border-t border-foreground/8 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <p className="font-serif text-2xl tracking-[0.28em] uppercase">Sandryne</p>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Style is more than what you wear — it&apos;s a story you live in. We curate
              elegance: timeless silhouettes, modern minimalism, effortless style.
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-60 transition-opacity"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:opacity-60 transition-opacity"
              >
                <TikTokIcon className="size-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Shop categories" className="lg:col-span-2">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Shop
            </h3>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="text-sm hover:opacity-60 transition-opacity"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="text-sm hover:opacity-60 transition-opacity">
                  Journal
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Customer care" className="lg:col-span-2">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Care
            </h3>
            <ul className="flex flex-col gap-2.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:opacity-60 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Get 10% off your first order
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join the list for new arrivals, editorial picks, and private offers —
              and unlock 10% off your first order.
            </p>
            <NewsletterFormLazy />
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-foreground/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground tracking-[0.18em] uppercase">
            We curate elegance
          </p>
        </div>
      </div>
    </footer>
  );
}
