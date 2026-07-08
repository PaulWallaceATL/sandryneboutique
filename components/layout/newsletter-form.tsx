"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeToNewsletter, type NewsletterResult } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const [result, formAction, pending] = useActionState<NewsletterResult | null, FormData>(
    subscribeToNewsletter,
    null
  );

  return (
    <div>
      <form action={formAction} className="flex items-center border-b border-foreground/30 pb-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="p-1 hover:opacity-60 transition-opacity disabled:opacity-40"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </button>
      </form>
      {result && (
        <p
          className={cn(
            "mt-2 text-xs",
            result.ok ? "text-muted-foreground" : "text-destructive"
          )}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
