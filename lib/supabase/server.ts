import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isAuthBypassEnabled } from "@/lib/auth-config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server client bound to the current request's auth cookies.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — session refresh is handled by proxy.ts.
          }
        },
      },
    }
  );
}

/**
 * Server client with admin privileges when AUTH_BYPASS=true.
 * Use for admin reads/writes that normally require a signed-in admin session.
 */
export async function createPrivilegedClient() {
  if (isAuthBypassEnabled() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  return createClient();
}
