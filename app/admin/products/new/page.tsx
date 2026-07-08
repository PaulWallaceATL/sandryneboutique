import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">New Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new piece to the Sandryne catalog.
        </p>
      </header>
      <ProductForm />
    </div>
  );
}
