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
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";
import type { Product } from "@/lib/types";
import { effectivePrice, formatPrice } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  let products: Product[] = [];

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    products = (data ?? []) as Product[];
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} in the catalog.
          </p>
        </div>
        <Button asChild className="rounded-none tracking-[0.16em] uppercase text-xs gap-2">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            New Product
          </Link>
        </Button>
      </header>

      <div className="border border-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                  No products yet — create your first one, or run the seed script in Supabase.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/admin/products/${product.id}`}>
                      <div className="relative w-10 h-13 bg-muted overflow-hidden">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
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
                      href={`/admin/products/${product.id}`}
                      className="font-medium hover:underline underline-offset-4"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {product.category.replace("-", " & ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(effectivePrice(product))}
                    {product.on_sale && (
                      <span className="block text-xs text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      product.inventory_count === 0 && "text-destructive",
                      product.inventory_count > 0 &&
                        product.inventory_count <= 5 &&
                        "text-amber-600"
                    )}
                  >
                    {product.inventory_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {product.is_new && (
                        <Badge variant="secondary" className="rounded-none text-[10px] uppercase">
                          New
                        </Badge>
                      )}
                      {product.on_sale && (
                        <Badge className="rounded-none text-[10px] uppercase">Sale</Badge>
                      )}
                      {product.inventory_count === 0 && (
                        <Badge variant="destructive" className="rounded-none text-[10px] uppercase">
                          Out
                        </Badge>
                      )}
                    </div>
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
