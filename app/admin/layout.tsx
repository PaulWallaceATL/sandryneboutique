import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionInfo } from "@/lib/auth";
import { isAuthBypassEnabled } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Sandryne Admin",
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const bypass = isAuthBypassEnabled();
  const { user, profile } = await getSessionInfo();

  if (!bypass) {
    if (!user) redirect("/login?next=/admin");
    if (profile?.role !== "admin") redirect("/account");
  }

  return <AdminShell>{children}</AdminShell>;
}
