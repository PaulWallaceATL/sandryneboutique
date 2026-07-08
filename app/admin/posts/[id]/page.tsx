import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getPostById, getPostProductIds } from "@/lib/data/posts";
import { getProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Edit Post",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await getPostById(id);
  if (!post) notFound();

  const [products, taggedIds] = await Promise.all([
    getProducts(),
    getPostProductIds(post.id),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Edit Post</h1>
        <p className="text-sm text-muted-foreground mt-1">{post.title}</p>
      </header>
      <PostForm
        post={post}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        }))}
        initialProductIds={taggedIds}
      />
    </div>
  );
}
