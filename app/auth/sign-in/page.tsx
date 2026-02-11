"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  // Password sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkCode, setMagicLinkCode] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState("");

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    void signIn("password", { email, password, flow: "signIn" })
      .then(() => router.push("/t"))
      .catch(() => setError("Invalid email or password. Please try again."))
      .finally(() => setLoading(false));
  };

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkError("");
    setMagicLinkLoading(true);
    void signIn("resend-otp", { email: magicLinkEmail })
      .then(() => setMagicLinkSent(true))
      .catch(() =>
        setMagicLinkError(
          "Failed to send verification code. Please try again.",
        ),
      )
      .finally(() => setMagicLinkLoading(false));
  };

  const handleVerifyMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkError("");
    setMagicLinkLoading(true);
    void signIn("resend-otp", {
      email: magicLinkEmail,
      code: magicLinkCode,
    })
      .then(() => router.push("/t"))
      .catch(() =>
        setMagicLinkError("Invalid or expired code. Please try again."),
      )
      .finally(() => setMagicLinkLoading(false));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email/Password Sign In */}
          <form onSubmit={handlePasswordSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Magic Link Sign In */}
          {!magicLinkSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="you@example.com"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  required
                />
              </div>
              {magicLinkError && (
                <p className="text-sm text-destructive">{magicLinkError}</p>
              )}
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={magicLinkLoading}
              >
                {magicLinkLoading
                  ? "Sending code..."
                  : "Sign in with email link"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMagicLink} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We sent a verification code to{" "}
                <span className="font-medium text-foreground">
                  {magicLinkEmail}
                </span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="12345678"
                  value={magicLinkCode}
                  onChange={(e) => setMagicLinkCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {magicLinkError && (
                <p className="text-sm text-destructive">{magicLinkError}</p>
              )}
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={magicLinkLoading}
              >
                {magicLinkLoading ? "Verifying..." : "Verify code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMagicLinkSent(false);
                  setMagicLinkCode("");
                  setMagicLinkError("");
                }}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
