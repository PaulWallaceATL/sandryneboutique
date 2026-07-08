import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawerLazy } from "@/components/cart/cart-drawer-lazy";
import { getMegaMenuProducts } from "@/lib/data/products";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const menu = await getMegaMenuProducts();

  return (
    <>
      <Header menu={menu} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawerLazy />
    </>
  );
}
