import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export interface SessionInfo {
  user: User | null;
  profile: Profile | null;
}

export async function getSessionInfo(): Promise<SessionInfo> {
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
