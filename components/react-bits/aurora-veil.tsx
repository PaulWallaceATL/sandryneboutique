import { cn } from "@/lib/utils";

interface AuroraVeilProps {
  className?: string;
  /** "light" for warm-white sections, "dark" for the inverted brand panel. */
  tone?: "light" | "dark";
}

/**
 * Subtle aurora wash: slow-drifting blurred gradient blobs in the site's
 * sand/taupe palette. Pure CSS (keyframes live in globals.css) — no JS, no
 * canvas — and absolutely positioned, so it contributes nothing to layout.
 * Mount inside a `relative isolate` container.
 */
export function AuroraVeil({ className, tone = "light" }: AuroraVeilProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        tone === "light" ? "aurora-veil-light" : "aurora-veil-dark",
        className,
      )}
    >
      <div className="aurora-blob aurora-blob-a" />
      <div className="aurora-blob aurora-blob-b" />
      <div className="aurora-blob aurora-blob-c" />
    </div>
  );
}
