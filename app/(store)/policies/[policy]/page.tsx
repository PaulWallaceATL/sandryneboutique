import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POLICIES, getPolicy } from "@/lib/policies";

export function generateStaticParams() {
  return POLICIES.map((p) => ({ policy: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const doc = getPolicy(policy);
  return { title: doc?.title ?? "Policies" };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const doc = getPolicy(policy);
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-4">
        Sandryne Boutique
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-6">{doc.title}</h1>
      <p className="text-muted-foreground leading-relaxed mb-12">{doc.intro}</p>

      <div className="space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[12px] tracking-[0.22em] uppercase mb-3">{section.heading}</h2>
            <div className="space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
