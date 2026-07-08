/**
 * Auth bypass for demos and local development.
 * Set AUTH_BYPASS=true to skip login gates and use the service role for admin data access.
 * Remove or set to false before production launch.
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.AUTH_BYPASS === "true";
}

/** Stable UUID for the synthetic demo admin session. */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export const DEMO_EMAIL = "demo@sandryneboutique.com";
