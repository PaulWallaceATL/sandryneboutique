"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp, type AuthResult } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export function AuthForm({ next }: { next: string }) {
  const [signInResult, signInAction, signInPending] = useActionState<AuthResult | null, FormData>(
    signIn,
    null
  );
  const [signUpResult, signUpAction, signUpPending] = useActionState<AuthResult | null, FormData>(
    signUp,
    null
  );

  return (
    <Tabs defaultValue="sign-in">
      <TabsList className="w-full rounded-none h-11">
        <TabsTrigger value="sign-in" className="rounded-none text-[11px] tracking-[0.18em] uppercase">
          Sign In
        </TabsTrigger>
        <TabsTrigger value="sign-up" className="rounded-none text-[11px] tracking-[0.18em] uppercase">
          Create Account
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sign-in" className="mt-6">
        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-none"
            />
          </div>
          {signInResult && !signInResult.ok && (
            <p className="text-xs text-destructive">{signInResult.message}</p>
          )}
          <Button
            type="submit"
            disabled={signInPending}
            className="w-full rounded-none h-11 tracking-[0.2em] uppercase text-xs"
          >
            {signInPending ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="sign-up" className="mt-6">
        <form action={signUpAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              name="full_name"
              autoComplete="name"
              required
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="rounded-none"
            />
          </div>
          {signUpResult && (
            <p
              className={cn(
                "text-xs",
                signUpResult.ok ? "text-muted-foreground" : "text-destructive"
              )}
            >
              {signUpResult.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={signUpPending}
            className="w-full rounded-none h-11 tracking-[0.2em] uppercase text-xs"
          >
            {signUpPending ? <Loader2 className="size-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
