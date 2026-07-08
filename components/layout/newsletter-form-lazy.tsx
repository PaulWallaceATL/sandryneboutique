"use client";

import dynamic from "next/dynamic";

const NewsletterForm = dynamic(
  () =>
    import("@/components/layout/newsletter-form").then((m) => ({
      default: m.NewsletterForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-9 border-b border-foreground/30 pb-2 animate-pulse bg-foreground/5" aria-hidden />
    ),
  },
);

export function NewsletterFormLazy() {
  return <NewsletterForm />;
}
