import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug, getPostProducts } from "@/lib/data/posts";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: post.cover_image
        ? [{ url: post.cover_image, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const products = await getPostProducts(post.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <JsonLd
        data={[
          blogPostingJsonLd(post),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
            { name: post.title },
          ]),
        ]}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-10 text-[11px] tracking-[0.16em] uppercase text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Journal
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground line-clamp-1">{post.title}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          {post.published_at && (
            <time
              dateTime={post.published_at}
              className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground"
            >
              {formatDate(post.published_at)}
            </time>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] mt-4 mb-5">
            {post.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {post.excerpt}
          </p>
        </header>

        {post.cover_image && (
          <div className="relative aspect-3/2 overflow-hidden bg-muted mb-12">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="text-[15px] leading-[1.85] text-foreground/85">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="font-serif text-3xl tracking-tight mt-12 mb-4 text-foreground">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-serif text-2xl tracking-tight mt-10 mb-3 text-foreground">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-5">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-5 flex flex-col gap-1.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-5 flex flex-col gap-1.5">{children}</ol>
              ),
              a: ({ href, children }) => (
                <Link
                  href={href ?? "#"}
                  className="underline underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  {children}
                </Link>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-foreground/20 pl-5 italic my-6">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {products.length > 0 && (
        <section aria-labelledby="shop-the-look" className="mt-24 border-t border-foreground/8 pt-16">
          <div className="mb-10 text-center">
            <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
              Featured in this story
            </p>
            <h2 id="shop-the-look" className="font-serif text-3xl sm:text-4xl tracking-tight">
              Shop <em className="italic font-light">the Look</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
