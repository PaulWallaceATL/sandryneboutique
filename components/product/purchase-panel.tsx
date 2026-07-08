"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/product/trust-badges";
import type { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface PurchasePanelProps {
  product: Product;
}

export function PurchasePanel({ product }: PurchasePanelProps) {
  const addItem = useCart((s) => s.addItem);
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [color, setColor] = useState<string | null>(
    product.colors.length === 1 ? product.colors[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const soldOut = product.inventory_count <= 0;
  const needsSize = product.sizes.length > 0 && !size;
  const needsColor = product.colors.length > 0 && !color;

  const handleAdd = () => {
    if (needsSize) {
      toast("Please select a size");
      return;
    }
    if (needsColor) {
      toast("Please select a color");
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice(product),
        image: product.images[0] ?? null,
        size,
        color,
        maxQuantity: product.inventory_count,
      },
      quantity
    );
  };

  return (
    <div className="flex flex-col gap-7">
      {product.colors.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
              Color
            </span>
            {color && <span className="text-xs">{color}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "px-4 py-2.5 border text-xs transition-colors",
                  color === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
              Size
            </span>
            {size && <span className="text-xs">{size}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-12 px-3 py-2.5 border text-xs transition-colors",
                  size === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-stretch gap-3">
        <div className="flex items-center border border-foreground/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 hover:bg-muted transition-colors h-full"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(product.inventory_count, q + 1))}
            className="px-3.5 hover:bg-muted transition-colors h-full"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <Button
          onClick={handleAdd}
          disabled={soldOut}
          className="flex-1 rounded-none h-12 tracking-[0.22em] uppercase text-xs"
        >
          {soldOut ? "Sold Out" : "Add to Cart"}
        </Button>
      </div>

      {!soldOut && product.inventory_count <= 5 && (
        <p className="text-xs text-destructive -mt-3">
          Only {product.inventory_count} left in stock
        </p>
      )}

      <TrustBadges className="-mt-2" />
    </div>
  );
}
