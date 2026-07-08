import type { Metadata } from "next";
import { PostForm } from "@/components/admin/post-form";
import { getProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "New Post",
};

export default async function NewPostPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">New Post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write a new story for the Sandryne journal.
        </p>
      </header>
      <PostForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        }))}
      />
    </div>
  );
}
