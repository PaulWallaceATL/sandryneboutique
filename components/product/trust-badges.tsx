import { Lock, RotateCcw, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGES = [
  { icon: Truck, label: "Free shipping over $200" },
  { icon: Lock, label: "Secure checkout" },
  { icon: RotateCcw, label: "14-day easy returns" },
];

interface TrustBadgesProps {
  className?: string;
  /** Stack badges vertically (for narrow containers like the cart drawer). */
  vertical?: boolean;
}

export function TrustBadges({ className, vertical = false }: TrustBadgesProps) {
  return (
    <ul
      className={cn(
        "flex gap-x-5 gap-y-2 text-muted-foreground",
        vertical ? "flex-col" : "flex-wrap items-center",
        className
      )}
    >
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="text-[11px] tracking-[0.08em]">{label}</span>
        </li>
      ))}
    </ul>
  );
}
