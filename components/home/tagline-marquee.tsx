const TAGLINES = [
  "Timeless Silhouettes",
  "Modern Minimalism",
  "Fashion Forward",
  "Effortless Style",
  "Curated Simplicity",
  "Elevated Look",
  "Effortless Elegance",
];

export function TaglineMarquee() {
  const row = TAGLINES.map((t, i) => (
    <span key={i} className="flex items-center gap-10 shrink-0">
      <span className="font-serif text-2xl sm:text-3xl italic tracking-wide">{t}</span>
      <span aria-hidden className="size-1.5 rounded-full bg-foreground/30" />
    </span>
  ));

  return (
    <section
      aria-label="Sandryne brand values"
      className="border-y border-foreground/8 py-6 overflow-hidden bg-secondary/50"
    >
      <div className="flex w-max gap-10 animate-marquee motion-reduce:animate-none">
        {row}
        <span aria-hidden className="flex items-center gap-10 shrink-0">
          {TAGLINES.map((t, i) => (
            <span key={i} className="flex items-center gap-10 shrink-0">
              <span className="font-serif text-2xl sm:text-3xl italic tracking-wide">{t}</span>
              <span className="size-1.5 rounded-full bg-foreground/30" />
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
