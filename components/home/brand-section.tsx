"use client";

import { useRef } from "react";
import { InstagramIcon } from "@/components/icons/social";
import { AuroraVeil } from "@/components/react-bits/aurora-veil";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import VariableProximity from "@/components/react-bits/variable-proximity";
import { SOCIAL_LINKS } from "@/lib/constants";

const VALUES = [
  {
    title: "Timeless Silhouettes",
    body: "Shapes that outlast seasons. We choose cuts that flatter today and still feel right years from now.",
  },
  {
    title: "Modern Minimalism",
    body: "Nothing extraneous. Clean lines, considered fabrics, and a palette that works as hard as you do.",
  },
  {
    title: "Effortless Elegance",
    body: "Style is more than what you wear — it's a story you live in. Every piece is curated to tell yours.",
  },
];

export function BrandSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      ref={containerRef}
      className="relative isolate bg-foreground text-background py-24 sm:py-32"
    >
      <AuroraVeil tone="dark" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-[11px] tracking-[0.24em] uppercase text-background/60 mb-6">
            The Sandryne Philosophy
          </p>
          <h2 className="font-sans text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-none">
            <VariableProximity
              label="We curate elegance"
              fromFontVariationSettings="'wght' 300"
              toFontVariationSettings="'wght' 800"
              containerRef={containerRef}
              radius={140}
              falloff="linear"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            />
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {VALUES.map((value) => (
            <SpotlightCard
              key={value.title}
              className="rounded-none border-background/15 bg-background/5 p-8 sm:p-10"
              spotlightColor="rgba(250, 249, 246, 0.14)"
            >
              <h3 className="font-serif text-2xl italic tracking-wide mb-4">{value.title}</h3>
              <p className="text-sm text-background/70 leading-relaxed">{value.body}</p>
            </SpotlightCard>
          ))}
        </div>

        <div className="mt-16 sm:mt-20 flex flex-col items-center gap-4 text-center">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <InstagramIcon className="size-5" />
            <span className="font-serif text-2xl sm:text-3xl italic">@sandryneboutique</span>
          </a>
          <p className="text-[11px] tracking-[0.24em] uppercase text-background/50">
            Be first to wear the story
          </p>
        </div>
      </div>
    </section>
  );
}
