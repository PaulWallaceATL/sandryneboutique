"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () =>
    import("@/components/cart/cart-drawer").then((m) => ({
      default: m.CartDrawer,
    })),
  { ssr: false },
);

export function CartDrawerLazy() {
  return <CartDrawer />;
}
