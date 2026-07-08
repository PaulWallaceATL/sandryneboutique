/**
 * Auth bypass for demos and local development.
 * Demo mode is ON by default so the storefront/admin are usable without login.
 * To enable REAL authentication, set AUTH_BYPASS=false (the only value that
 * disables the bypass). Any other value — or no value — keeps demo mode on.
 */
export function isAuthBypassEnabled(): boolean {
  const raw = process.env.AUTH_BYPASS?.trim().toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "no" && raw !== "off";
}

/** Stable UUID for the synthetic demo admin session. */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export const DEMO_EMAIL = "demo@sandryneboutique.com";
