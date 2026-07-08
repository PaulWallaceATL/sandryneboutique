export interface DiscountDef {
  code: string;
  percentOff: number;
  description: string;
}

export const NEW_CUSTOMER_CODE = "NEW10";

export const DISCOUNT_CODES: DiscountDef[] = [
  {
    code: NEW_CUSTOMER_CODE,
    percentOff: 10,
    description: "10% off your first order",
  },
];

export function findDiscount(code: string | null | undefined): DiscountDef | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return DISCOUNT_CODES.find((d) => d.code === normalized) ?? null;
}

/** Discount amount in dollars for a given subtotal, rounded to cents. */
export function discountAmount(subtotal: number, def: DiscountDef): number {
  return Math.round(subtotal * def.percentOff) / 100;
}
