import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPosts } from "@/lib/data/posts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Posts",
};

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "published" || status === "draft" ? status : "all";
  const posts = await getPosts({ includeDrafts: true });
  const filtered =
    filter === "all"
      ? posts
      : posts.filter((p) => (filter === "published" ? p.published : !p.published));

  const filters = [
    { value: "all", label: "All", href: "/admin/posts" },
    { value: "published", label: "Published", href: "/admin/posts?status=published" },
    { value: "draft", label: "Drafts", href: "/admin/posts?status=draft" },
  ] as const;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
            {filter !== "all" ? ` (${filter})` : ""}.
          </p>
        </div>
        <Button
          asChild
          className="rounded-none tracking-[0.16em] uppercase text-xs gap-2 w-full sm:w-auto"
        >
          <Link href="/admin/posts/new">
            <Plus className="size-4" />
            New Post
          </Link>
        </Button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((item) => (
          <Link
            key={item.value}
            href={item.href}
            className={cn(
              "shrink-0 px-3 sm:px-4 py-1.5 border text-[11px] tracking-[0.14em] uppercase transition-colors",
              filter === item.value
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 hover:border-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-foreground/15">
          <p className="font-serif text-2xl mb-2">No posts found</p>
          <p className="text-sm text-muted-foreground">Write a story or adjust the status filter.</p>
        </div>
      ) : (
        <>
          <ul className="md:hidden space-y-3">
            {filtered.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="flex gap-3 border border-foreground/10 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="relative w-16 h-20 bg-muted shrink-0 overflow-hidden">
                    {post.cover_image && (
                      <Image
                        src={post.cover_image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-medium leading-snug">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
                    {post.published ? (
                      <Badge variant="secondary" className="rounded-none text-[10px] uppercase">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none text-[10px] uppercase">
                        Draft
                      </Badge>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block border border-foreground/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Link href={`/admin/posts/${post.id}`}>
                        <div className="relative w-10 h-13 bg-muted overflow-hidden">
                          {post.cover_image && (
                            <Image
                              src={post.cover_image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="font-medium hover:underline underline-offset-4"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{post.slug}</p>
                    </TableCell>
                    <TableCell>
                      {post.published ? (
                        <Badge variant="secondary" className="rounded-none text-[10px] uppercase">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-none text-[10px] uppercase">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(post.published_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
