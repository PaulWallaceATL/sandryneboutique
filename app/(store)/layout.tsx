import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
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
      <CartDrawer />
    </>
  );
}
