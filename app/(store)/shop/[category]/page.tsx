import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BlurHighlight from "@/components/react-bits/blur-highlight";
import { FilterBar } from "@/components/product/filter-bar";
import { ProductCard } from "@/components/product/product-card";
import { CATEGORIES, getCategory } from "@/lib/constants";
import { getProducts, type ProductSort } from "@/lib/data/products";
import { effectivePrice } from "@/lib/types";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const def = getCategory(category);
  if (!def) return { title: "Shop" };
  return { title: def.label, description: def.description };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ category }, sp] = await Promise.all([params, searchParams]);
  const def = getCategory(category);
  if (!def) notFound();

  const sort = (first(sp.sort) as ProductSort | undefined) ?? "newest";
  const size = first(sp.size);
  const color = first(sp.color);
  const max = first(sp.max) ? Number(first(sp.max)) : undefined;

  const baseQuery = {
    category: def.dbCategory ?? undefined,
    isNew: def.slug === "new-arrivals" || undefined,
    onSale: def.slug === "sale" || undefined,
  };

  // Unfiltered set drives the available filter options.
  const [allInCategory, filtered] = await Promise.all([
    getProducts(baseQuery),
    getProducts({ ...baseQuery, sort, size, color, maxPrice: max }),
  ]);

  const availableSizes = [...new Set(allInCategory.flatMap((p) => p.sizes))];
  const availableColors = [...new Set(allInCategory.flatMap((p) => p.colors))].sort();
  const maxCatalogPrice = Math.ceil(
    Math.max(0, ...allInCategory.map((p) => effectivePrice(p)))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-10 sm:mb-14 max-w-2xl">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
          Sandryne Boutique
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-5">{def.label}</h1>
        <BlurHighlight
          className="text-muted-foreground leading-relaxed"
          blurAmount={6}
          viewportOptions={{ once: true, amount: 0.4 }}
        >
          {def.description}
        </BlurHighlight>
      </header>

      <div className="mb-8">
        <Suspense>
          <FilterBar
            availableSizes={availableSizes}
            availableColors={availableColors}
            maxCatalogPrice={maxCatalogPrice}
            resultCount={filtered.length}
          />
        </Suspense>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl mb-3">Nothing here yet</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters — or check back soon for new pieces.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
