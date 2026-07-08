"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createPost,
  deletePost,
  updatePost,
  type PostInput,
} from "@/app/admin/actions";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TaggableProduct {
  id: string;
  name: string;
  category: string;
}

interface PostFormProps {
  post?: Post;
  /** All catalog products available for "Shop the Look" tagging. */
  products: TaggableProduct[];
  /** Currently tagged product ids, in display order (edit mode). */
  initialProductIds?: string[];
}

export function PostForm({ post, products, initialProductIds = [] }: PostFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [productIds, setProductIds] = useState<string[]>(initialProductIds);

  const toggleProduct = (id: string) => {
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const buildInput = (): PostInput => ({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt.trim(),
    content: content.trim(),
    cover_image: coverImage.trim() || null,
    published,
    product_ids: productIds,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const input = buildInput();
      const result = post
        ? await updatePost(post.id, input)
        : await createPost(input);

      if (result.ok) {
        toast.success(result.message);
        router.push("/admin/posts");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = () => {
    if (!post) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        toast.success(result.message);
        router.push("/admin/posts");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            className="rounded-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="rounded-none font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cover_image">Cover image URL</Label>
          <Input
            id="cover_image"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://…"
            className="rounded-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="excerpt">Excerpt (also used as the SEO description)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            required
            className="rounded-none"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="content">Content (Markdown — use ## for section headings)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            required
            className="rounded-none font-mono text-sm leading-relaxed"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Shop the Look — tagged products ({productIds.length})</Label>
        <p className="text-xs text-muted-foreground">
          Tagged products appear in a &ldquo;Shop the Look&rdquo; section at the end of the
          post, in the order you select them.
        </p>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => {
            const selected = productIds.includes(product.id);
            const order = productIds.indexOf(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/50"
                )}
              >
                {selected && (
                  <>
                    <Check className="size-3" />
                    <span className="tabular-nums">{order + 1}.</span>
                  </>
                )}
                {product.name}
              </button>
            );
          })}
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No products in the catalog yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={published} onCheckedChange={setPublished} />
          Published
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-foreground/8">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-none tracking-[0.18em] uppercase text-xs h-11 px-8"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Post"
          )}
        </Button>

        {isEdit && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-none text-destructive gap-2 text-xs tracking-[0.14em] uppercase"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this post?</DialogTitle>
                <DialogDescription>
                  &ldquo;{post?.title}&rdquo; will be permanently removed from the journal.
                  This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={handleDelete}
                  className="rounded-none"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" /> : "Delete Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </form>
  );
}
