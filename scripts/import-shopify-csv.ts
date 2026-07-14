/**
 * One-time Shopify product CSV → Supabase import.
 *
 * Usage:
 *   npm run import:shopify -- [--dry-run] [--active-only] [--force-images] [path/to.csv]
 *
 * Defaults:
 *   - CSV path: data/shopify-products.csv
 *   - Imports Active + Draft; skips Archived
 *   - Downloads Image Src URLs into the public `product-images` bucket
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { mapShopifyCategory, type DbCategory } from "./shopify-category-map";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv(); // fallback .env

const BUCKET = "product-images";
const DEFAULT_CSV = resolve(process.cwd(), "data/shopify-products.csv");

interface ShopifyRow {
  Handle: string;
  Title?: string;
  "Body (HTML)"?: string;
  Vendor?: string;
  Type?: string;
  Tags?: string;
  Published?: string;
  Status?: string;
  "Option1 Name"?: string;
  "Option1 Value"?: string;
  "Option2 Name"?: string;
  "Option2 Value"?: string;
  "Option3 Name"?: string;
  "Option3 Value"?: string;
  "Variant Price"?: string;
  "Variant Compare At Price"?: string;
  "Variant Inventory Qty"?: string;
  "Image Src"?: string;
  "Image Position"?: string;
  "Variant Image"?: string;
  [key: string]: string | undefined;
}

interface ParsedProduct {
  handle: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  inventoryCount: number;
  sizes: string[];
  colors: string[];
  category: DbCategory;
  categoryUnmapped: boolean;
  categorySource: string;
  imageUrls: string[];
  status: string;
  productType: string;
  tags: string[];
  isNew: boolean;
}

interface CliOptions {
  csvPath: string;
  dryRun: boolean;
  activeOnly: boolean;
  forceImages: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  let dryRun = false;
  let activeOnly = false;
  let forceImages = false;
  let csvPath = DEFAULT_CSV;

  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--active-only") activeOnly = true;
    else if (arg === "--force-images") forceImages = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: npm run import:shopify -- [flags] [path/to.csv]

Flags:
  --dry-run         Parse and report only (no uploads / DB writes)
  --active-only     Skip draft / unlisted (default imports active + draft)
  --force-images    Re-download images even if Supabase URLs already stored

Default CSV path: data/shopify-products.csv

Examples:
  npm run import:shopify -- --dry-run
  npm run import:shopify
`);
      process.exit(0);
    } else if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    } else if (arg.toLowerCase().endsWith(".csv")) {
      csvPath = resolve(process.cwd(), arg);
    } else {
      console.warn(
        `Ignoring unexpected argument "${arg}" (pass a .csv path, or omit for data/shopify-products.csv).`
      );
    }
  }

  return { csvPath, dryRun, activeOnly, forceImages };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function htmlToText(html: string): string {
  if (!html) return "";
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseMoney(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseQty(raw: string | undefined): number {
  if (raw == null || raw.trim() === "") return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function slugify(handle: string): string {
  return handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function optionBucket(name: string | undefined): "size" | "color" | "other" {
  const n = (name ?? "").trim().toLowerCase();
  if (!n) return "other";
  if (n === "size" || n === "sizes" || n.includes("size")) return "size";
  if (n === "color" || n === "colour" || n === "colors" || n === "colours" || n.includes("color")) {
    return "color";
  }
  return "other";
}

function pushUnique(list: string[], value: string | undefined) {
  const v = value?.trim();
  if (!v || v.toLowerCase() === "default title") return;
  if (!list.some((x) => x.toLowerCase() === v.toLowerCase())) list.push(v);
}

function rowStatus(row: ShopifyRow): string {
  const status = (row.Status ?? "").trim().toLowerCase();
  if (status) return status;
  const published = (row.Published ?? "").trim().toLowerCase();
  if (published === "true" || published === "1" || published === "yes") return "active";
  if (published === "false" || published === "0" || published === "no") return "draft";
  return "active";
}

function groupProducts(rows: ShopifyRow[]): ParsedProduct[] {
  const byHandle = new Map<string, ShopifyRow[]>();

  for (const row of rows) {
    const handle = (row.Handle ?? "").trim();
    if (!handle) continue;
    const list = byHandle.get(handle) ?? [];
    list.push(row);
    byHandle.set(handle, list);
  }

  const products: ParsedProduct[] = [];

  for (const [handle, group] of byHandle) {
    const titleRow = group.find((r) => (r.Title ?? "").trim()) ?? group[0];
    const name = (titleRow.Title ?? handle).trim();
    const description = htmlToText(titleRow["Body (HTML)"] ?? "");
    const productType = (titleRow.Type ?? "").trim();
    const tags = parseTags(titleRow.Tags);
    const status = rowStatus(titleRow);
    const slug = slugify(handle);

    const sizes: string[] = [];
    const colors: string[] = [];
    let inventoryCount = 0;
    let price: number | null = null;
    let compareAt: number | null = null;

    const imageByUrl = new Map<string, number>();

    for (const row of group) {
      const buckets = [
        { name: row["Option1 Name"], value: row["Option1 Value"] },
        { name: row["Option2 Name"], value: row["Option2 Value"] },
        { name: row["Option3 Name"], value: row["Option3 Value"] },
      ];
      for (const opt of buckets) {
        const bucket = optionBucket(opt.name);
        if (bucket === "size") pushUnique(sizes, opt.value);
        else if (bucket === "color") pushUnique(colors, opt.value);
      }

      inventoryCount += parseQty(row["Variant Inventory Qty"]);

      const variantPrice = parseMoney(row["Variant Price"]);
      if (variantPrice != null && price == null) price = variantPrice;

      const variantCompare = parseMoney(row["Variant Compare At Price"]);
      if (variantCompare != null && compareAt == null) compareAt = variantCompare;

      for (const src of [row["Image Src"], row["Variant Image"]]) {
        const url = src?.trim();
        if (!url) continue;
        const position = Number.parseInt(row["Image Position"] ?? "", 10);
        const rank = Number.isFinite(position) ? position : imageByUrl.size + 1000;
        if (!imageByUrl.has(url) || rank < (imageByUrl.get(url) ?? Infinity)) {
          imageByUrl.set(url, rank);
        }
      }
    }

    const imageUrls = [...imageByUrl.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([url]) => url);

    const effectivePrice = price ?? 0;
    const onSale =
      compareAt != null && compareAt > effectivePrice && effectivePrice >= 0;
    // Shopify: Variant Price is selling price; Compare At is original.
    // Our schema: price = regular, sale_price = discounted when on_sale.
    const mappedPrice = onSale ? compareAt! : effectivePrice;
    const salePrice = onSale ? effectivePrice : null;

    const mapped = mapShopifyCategory(productType, tags, name);
    const isNew = tags.some((t) => /\bnew\b/i.test(t));

    products.push({
      handle,
      name,
      description,
      slug: slug || createHash("sha1").update(handle).digest("hex").slice(0, 12),
      price: mappedPrice,
      salePrice,
      onSale,
      inventoryCount,
      sizes,
      colors,
      category: mapped.category,
      categoryUnmapped: mapped.unmapped,
      categorySource: mapped.source,
      imageUrls,
      status,
      productType,
      tags,
      isNew,
    });
  }

  return products;
}

function extFromContentType(contentType: string | null, url: string): string {
  const fromUrl = url.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (fromUrl && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(fromUrl)) {
    return fromUrl === "jpeg" ? "jpg" : fromUrl;
  }
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
}

async function downloadImage(
  url: string
): Promise<{ bytes: Buffer; contentType: string; ext: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SandryneBoutiqueImporter/1.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  ! image fetch ${res.status}: ${url}`);
      return null;
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      console.warn(`  ! not an image (${contentType}): ${url}`);
      return null;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0) {
      console.warn(`  ! empty image: ${url}`);
      return null;
    }
    return {
      bytes,
      contentType: contentType.startsWith("image/") ? contentType : "image/jpeg",
      ext: extFromContentType(contentType, url),
    };
  } catch (err) {
    console.warn(`  ! image error: ${url}`, err);
    return null;
  }
}

async function uploadImages(
  supabase: SupabaseClient,
  urls: string[]
): Promise<{ publicUrls: string[]; failures: string[] }> {
  const publicUrls: string[] = [];
  const failures: string[] = [];

  for (const url of urls) {
    const downloaded = await downloadImage(url);
    if (!downloaded) {
      failures.push(url);
      continue;
    }

    const path = `${randomUUID()}.${downloaded.ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, downloaded.bytes, {
      contentType: downloaded.contentType,
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      console.warn(`  ! upload failed ${path}: ${error.message}`);
      failures.push(url);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    publicUrls.push(publicUrl);
  }

  return { publicUrls, failures };
}

function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set in .env.local)."
    );
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function upsertProduct(
  supabase: SupabaseClient,
  product: ParsedProduct,
  images: string[]
): Promise<"inserted" | "updated"> {
  const payload = {
    name: product.name,
    description: product.description,
    price: product.price,
    images,
    inventory_count: product.inventoryCount,
    category: product.category,
    slug: product.slug,
    sizes: product.sizes,
    colors: product.colors,
    is_new: product.isNew,
    on_sale: product.onSale,
    sale_price: product.onSale ? product.salePrice : null,
  };

  const { data: existing, error: selectError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product.slug)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Lookup failed for ${product.slug}: ${selectError.message}`);
  }

  if (existing) {
    const { error } = await supabase.from("products").update(payload).eq("id", existing.id);
    if (error) throw new Error(`Update failed for ${product.slug}: ${error.message}`);
    return "updated";
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(`Insert failed for ${product.slug}: ${error.message}`);
  return "inserted";
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(opts.csvPath)) {
    console.error(`
CSV not found: ${opts.csvPath}

Export from Shopify Admin → Products → Export:
  1. Select "All products"
  2. CSV for Excel, Numbers, or other spreadsheet programs
  3. Save as data/shopify-products.csv

Then re-run: npm run import:shopify
`);
    process.exit(1);
  }

  console.log(`Reading ${opts.csvPath}`);
  const raw = readFileSync(opts.csvPath, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  }) as ShopifyRow[];

  const all = groupProducts(rows);
  const products = all.filter((p) => {
    if (p.status === "archived") return false;
    if (opts.activeOnly && p.status !== "active") return false;
    return true;
  });

  const skippedArchived = all.filter((p) => p.status === "archived").length;
  const skippedDraft = opts.activeOnly
    ? all.filter((p) => p.status === "draft").length
    : 0;

  console.log(
    `Parsed ${all.length} products → importing ${products.length}` +
      (skippedArchived ? ` (skipped ${skippedArchived} archived)` : "") +
      (skippedDraft ? ` (skipped ${skippedDraft} draft)` : "") +
      (opts.dryRun ? " [DRY RUN]" : "")
  );

  const supabase = opts.dryRun ? null : createServiceClient();

  let inserted = 0;
  let updated = 0;
  let dryCounted = 0;
  let imageFailures = 0;
  const unmapped: Array<{ slug: string; type: string; tags: string; category: string }> =
    [];
  const errors: string[] = [];

  for (const product of products) {
    process.stdout.write(`→ ${product.slug} (${product.status})… `);

    if (product.categoryUnmapped) {
      unmapped.push({
        slug: product.slug,
        type: product.productType || "(none)",
        tags: product.tags.join(", ") || "(none)",
        category: `${product.category} via ${product.categorySource}`,
      });
    }

    try {
      let images: string[] = [];

      if (opts.dryRun) {
        images = product.imageUrls.map((u) => `[dry-run]${u}`);
        process.stdout.write(
          product.imageUrls.length
            ? `${product.imageUrls.length} image URL(s), `
            : "no images, "
        );
        dryCounted++;
        console.log(
          `dry-run | ${product.category} | $${product.price}` +
            (product.onSale ? ` (sale $${product.salePrice})` : "") +
            ` | inv ${product.inventoryCount}` +
            ` | ${product.sizes.length} sizes / ${product.colors.length} colors`
        );
        continue;
      }

      const client = supabase!;

      if (product.imageUrls.length > 0) {
        const { data: existing } = await client
          .from("products")
          .select("images")
          .eq("slug", product.slug)
          .maybeSingle();

        const hasStored =
          !opts.forceImages &&
          Array.isArray(existing?.images) &&
          existing.images.length > 0 &&
          existing.images.every(
            (u: string) =>
              typeof u === "string" && u.includes("/storage/v1/object/public/")
          );

        if (hasStored) {
          images = existing!.images as string[];
          process.stdout.write(`keep ${images.length} stored images, `);
        } else {
          const result = await uploadImages(client, product.imageUrls);
          images = result.publicUrls;
          imageFailures += result.failures.length;
          process.stdout.write(
            `uploaded ${images.length}/${product.imageUrls.length} images, `
          );
        }
      } else {
        process.stdout.write("no images, ");
      }

      const result = await upsertProduct(client, product, images);

      if (result === "inserted") inserted++;
      else if (result === "updated") updated++;

      console.log(
        `${result} | ${product.category} | $${product.price}` +
          (product.onSale ? ` (sale $${product.salePrice})` : "") +
          ` | inv ${product.inventoryCount}` +
          ` | ${product.sizes.length} sizes / ${product.colors.length} colors`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${product.slug}: ${message}`);
      console.log(`ERROR: ${message}`);
    }
  }

  console.log("\n========== Import report ==========");
  console.log(`Imported/updated: ${inserted} inserted, ${updated} updated, ${dryCounted} dry-run`);
  console.log(`Image download/upload failures: ${imageFailures}`);
  console.log(`Category review needed: ${unmapped.length}`);
  if (unmapped.length) {
    console.log("\nUnmapped / heuristic categories (review in admin):");
    for (const u of unmapped) {
      console.log(`  - ${u.slug}: type="${u.type}" tags="${u.tags}" → ${u.category}`);
    }
  }
  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
  console.log("===================================\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
