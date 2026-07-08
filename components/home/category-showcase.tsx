"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import HoverPreview from "@/components/react-bits/hover-preview";

const CATEGORY_TILES = [
  {
    slug: "bottoms",
    label: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "dresses",
    label: "Dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "tops",
    label: "Tops",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
  },
];

export function CategoryShowcase() {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <h2 className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-5">
          Shop by Category
        </h2>
        <HoverPreview
          content="Tailored {0}, fluid {1}, and crisp {2} — every piece chosen to live together, effortlessly."
          targets={CATEGORY_TILES.map((tile) => ({
            text: tile.label.toLowerCase(),
            imageUrl: tile.image,
            linkUrl: `/shop/${tile.slug}`,
            altText: tile.label,
          }))}
          onTargetClick={(_, index) => router.push(`/shop/${CATEGORY_TILES[index].slug}`)}
          imagePosition="above"
          imageWidth={220}
          imageHeight={280}
          imageBorderRadius="0"
          className="font-serif text-3xl sm:text-5xl leading-[1.15] tracking-tight"
          targetClassName="italic underline decoration-1 underline-offset-8 decoration-foreground/30 hover:decoration-foreground"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {CATEGORY_TILES.map((tile, i) => (
          <motion.div
            key={tile.slug}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link href={`/shop/${tile.slug}`} className="group block relative overflow-hidden">
              <div className="relative aspect-3/4 bg-muted">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
                <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
                  {tile.label}
                </h3>
                <span className="text-[10px] tracking-[0.22em] uppercase text-white/80 group-hover:text-white transition-colors">
                  Shop now
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
