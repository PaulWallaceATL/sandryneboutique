"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { NEW_CUSTOMER_CODE } from "@/lib/discounts";

export interface NewsletterResult {
  ok: boolean;
  message: string;
}

export async function subscribeToNewsletter(
  _prev: NewsletterResult | null,
  formData: FormData
): Promise<NewsletterResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });

    if (error) {
      // 23505 = unique_violation: already subscribed
      if (error.code === "23505") {
        return {
          ok: true,
          message: `You're already on the list — use code ${NEW_CUSTOMER_CODE} for 10% off your first order.`,
        };
      }
      console.error("Newsletter subscription failed:", error);
      return { ok: false, message: "Something went wrong. Please try again." };
    }

    return {
      ok: true,
      message: `Welcome to the story. Use code ${NEW_CUSTOMER_CODE} at checkout for 10% off your first order.`,
    };
  } catch (err) {
    console.error("Newsletter subscription failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
