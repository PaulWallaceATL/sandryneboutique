import type { Metadata } from "next";
import { NewsletterList } from "@/components/admin/newsletter-list";
import { createPrivilegedClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Newsletter",
};

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default async function AdminNewsletterPage() {
  let subscribers: Subscriber[] = [];

  if (supabaseConfigured()) {
    const supabase = await createPrivilegedClient();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    subscribers = (data ?? []) as Subscriber[];
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {subscribers.length}{" "}
          {subscribers.length === 1 ? "subscriber" : "subscribers"} from the storefront signup.
        </p>
      </header>

      <NewsletterList subscribers={subscribers} />
    </div>
  );
}
