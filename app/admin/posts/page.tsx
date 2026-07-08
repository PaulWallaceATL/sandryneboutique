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

export default async function AdminPostsPage() {
  const posts = await getPosts({ includeDrafts: true });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} {posts.length === 1 ? "post" : "posts"} in the journal.
          </p>
        </div>
        <Button asChild className="rounded-none tracking-[0.16em] uppercase text-xs gap-2">
          <Link href="/admin/posts/new">
            <Plus className="size-4" />
            New Post
          </Link>
        </Button>
      </header>

      <div className="border border-foreground/10">
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
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                  No posts yet — write your first story, or run the blog migration in Supabase.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
