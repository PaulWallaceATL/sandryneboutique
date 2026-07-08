import "server-only";
import { DEMO_EMAIL, DEMO_USER_ID, isAuthBypassEnabled } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export interface SessionInfo {
  user: User | null;
  profile: Profile | null;
}

const DEMO_SESSION: SessionInfo = {
  user: {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    app_metadata: {},
    user_metadata: { full_name: "Demo Admin" },
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
  } as User,
  profile: {
    id: DEMO_USER_ID,
    full_name: "Demo Admin",
    email: DEMO_EMAIL,
    role: "admin",
    created_at: new Date(0).toISOString(),
  },
};

export async function getSessionInfo(): Promise<SessionInfo> {
  if (isAuthBypassEnabled()) {
    return DEMO_SESSION;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: (profile as Profile | null) ?? null };
}

export async function isAdmin(): Promise<boolean> {
  const { profile } = await getSessionInfo();
  return profile?.role === "admin";
}
