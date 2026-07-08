import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionInfo } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, { user }] = await Promise.all([searchParams, getSessionInfo()]);

  if (user) {
    redirect(next?.startsWith("/") ? next : "/account");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
      <header className="mb-10 text-center">
        <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mb-3">
          Sandryne Boutique
        </p>
        <h1 className="font-serif text-4xl tracking-tight">Welcome back</h1>
      </header>
      <AuthForm next={next?.startsWith("/") ? next : "/account"} />
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
