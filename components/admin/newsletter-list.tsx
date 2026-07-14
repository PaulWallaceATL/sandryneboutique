"use client";

import { useTransition } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteNewsletterSubscriber } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export interface NewsletterRow {
  id: string;
  email: string;
  created_at: string;
}

export function NewsletterList({ subscribers }: { subscribers: NewsletterRow[] }) {
  const [pending, startTransition] = useTransition();

  const exportCsv = () => {
    const header = "email,subscribed_at\n";
    const body = subscribers
      .map((s) => `${JSON.stringify(s.email)},${JSON.stringify(s.created_at)}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sandryne-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = (id: string, email: string) => {
    startTransition(async () => {
      const result = await deleteNewsletterSubscriber(id);
      if (result.ok) toast.success(`Removed ${email}`);
      else toast.error(result.message);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="rounded-none text-xs tracking-[0.14em] uppercase gap-2"
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-foreground/15">
          <p className="font-serif text-2xl mb-2">No subscribers yet</p>
          <p className="text-sm text-muted-foreground">
            Signups from the store footer will appear here.
          </p>
        </div>
      ) : (
        <ul className="border border-foreground/10 divide-y divide-foreground/8">
          {subscribers.map((sub) => (
            <li
              key={sub.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium break-all">{sub.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joined{" "}
                  {new Date(sub.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => remove(sub.id, sub.email)}
                className="rounded-none self-start sm:self-auto text-destructive gap-1.5 text-xs tracking-[0.12em] uppercase"
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
