import type { HoverTarget } from "@/components/react-bits/hover-preview";
import type { Product } from "@/lib/types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Convert plain text into HoverPreview placeholders for catalog product names. */
export function buildMentionPlan(
  text: string,
  products: Product[],
): { content: string; targets: HoverTarget[] } | null {
  const withImages = products.filter((p) => p.images[0]);
  if (!text || withImages.length === 0) return null;

  const sorted = withImages.toSorted((a, b) => b.name.length - a.name.length);
  type Match = { start: number; end: number; product: Product };
  const matches: Match[] = [];

  for (const product of sorted) {
    const re = new RegExp(escapeRegExp(product.name), "g");
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const end = start + product.name.length;
      if (matches.some((x) => start < x.end && end > x.start)) continue;
      matches.push({ start, end, product });
    }
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => a.start - b.start);

  const targets: HoverTarget[] = [];
  let content = "";
  let cursor = 0;

  for (const match of matches) {
    content += text.slice(cursor, match.start);
    const idx = targets.length;
    targets.push({
      text: match.product.name,
      imageUrl: match.product.images[0],
      linkUrl: `/products/${match.product.slug}`,
      altText: match.product.name,
    });
    content += `{${idx}}`;
    cursor = match.end;
  }
  content += text.slice(cursor);

  return { content, targets };
}
