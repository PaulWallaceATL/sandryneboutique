import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, LayoutDashboard, Package, ShoppingBag, Store, Users } from "lucide-react";
import { getSessionInfo } from "@/lib/auth";
import { isAuthBypassEnabled } from "@/lib/auth-config";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Sandryne Admin",
  },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const bypass = isAuthBypassEnabled();
  const { user, profile } = await getSessionInfo();

  if (!bypass) {
    if (!user) redirect("/login?next=/admin");
    if (profile?.role !== "admin") redirect("/account");
  }

  return (
    <div className={bypass ? "flex flex-1 min-h-screen pt-7" : "flex flex-1 min-h-screen"}>
      {bypass && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-amber-950 text-center text-xs tracking-wide py-1.5 px-4">
          Demo mode — auth bypassed. Set <code className="font-mono">AUTH_BYPASS=false</code> before
          launch.
        </div>
      )}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-foreground/8 bg-card">
        <div className="px-6 py-6 border-b border-foreground/8">
          <Link href="/admin" className="font-serif text-lg tracking-[0.24em] uppercase">
            Sandryne
          </Link>
          <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
            Command Center
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="size-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-foreground/8 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Store className="size-4" strokeWidth={1.5} />
            View Store
          </Link>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start px-3 text-sm font-normal text-muted-foreground"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden border-b border-foreground/8 px-4 py-3 flex items-center justify-between glass sticky top-0 z-30">
          <Link href="/admin" className="font-serif tracking-[0.2em] uppercase">
            Admin
          </Link>
          <nav className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} aria-label={item.label}>
                <item.icon className="size-4.5" strokeWidth={1.5} />
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
