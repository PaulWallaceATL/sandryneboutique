import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/data/posts";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "The Journal — Style Guides, Trend Reports & Editorials",
  description:
    "Style guides, capsule wardrobe edits, and seasonal trend reports from Sandryne Boutique. How to wear, style, and care for curated luxury women's fashion.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Journal | Sandryne Boutique",
    description:
      "Style guides, capsule wardrobe edits, and seasonal trend reports from Sandryne Boutique.",
    url: "/blog",
  },
};

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal" },
        ])}
      />

      <header className="mb-12 sm:mb-16 max-w-2xl">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
          Sandryne Boutique
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-5">
          The <em className="italic font-light">Journal</em>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Style guides, wardrobe edits, and the stories behind the pieces —
          written to help you wear the story, beautifully.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl mb-3">Stories coming soon</p>
          <p className="text-sm text-muted-foreground">
            Our first editorials are on their way — check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {posts.map((post, i) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-4/3 overflow-hidden bg-muted mb-5">
                  {post.cover_image && (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      priority={i < 3}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                {post.published_at && (
                  <time
                    dateTime={post.published_at}
                    className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground"
                  >
                    {formatDate(post.published_at)}
                  </time>
                )}
                <h2 className="font-serif text-2xl tracking-tight leading-snug mt-2 mb-2 group-hover:underline underline-offset-4 decoration-1">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
