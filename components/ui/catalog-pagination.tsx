import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  /** Build href for a 1-based page number. */
  hrefForPage: (page: number) => string;
  className?: string;
}

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));
  return [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}

export function CatalogPagination({
  page,
  totalPages,
  hrefForPage,
  className,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1 pt-12 sm:pt-16", className)}
    >
      <PaginationLink
        href={page > 1 ? hrefForPage(page - 1) : null}
        label="Previous page"
        className="px-2"
      >
        <ChevronLeft className="size-4" />
      </PaginationLink>

      {pages.map((n, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev != null && n - prev > 1;
        return (
          <span key={n} className="contents">
            {showEllipsis && (
              <span className="px-2 text-xs text-muted-foreground" aria-hidden>
                …
              </span>
            )}
            <PaginationLink
              href={n === page ? null : hrefForPage(n)}
              label={`Page ${n}`}
              current={n === page}
            >
              {n}
            </PaginationLink>
          </span>
        );
      })}

      <PaginationLink
        href={page < totalPages ? hrefForPage(page + 1) : null}
        label="Next page"
        className="px-2"
      >
        <ChevronRight className="size-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  label,
  current,
  className,
  children,
}: {
  href: string | null;
  label: string;
  current?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const base =
    "inline-flex min-w-9 h-9 items-center justify-center text-xs tabular-nums transition-colors";

  if (!href) {
    return (
      <span
        aria-label={label}
        aria-current={current ? "page" : undefined}
        className={cn(
          base,
          current ? "bg-foreground text-background" : "text-muted-foreground opacity-40",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(base, "hover:bg-foreground/5 text-foreground", className)}
    >
      {children}
    </Link>
  );
}
