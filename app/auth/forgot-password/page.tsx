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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "request" | "verify" | "success";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    void signIn("password", { email, flow: "reset" })
      .then(() => setStep("verify"))
      .catch(() =>
        setError(
          "Failed to send reset code. Please check your email and try again.",
        ),
      )
      .finally(() => setLoading(false));
  };

  const handleVerifyReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    void signIn("password", {
      email,
      code,
      newPassword,
      flow: "reset-verification",
    })
      .then(() => setStep("success"))
      .catch(() => setError("Invalid or expired code. Please try again."))
      .finally(() => setLoading(false));
  };

  if (step === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password reset</CardTitle>
            <CardDescription>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/auth/sign-in")}
            >
              Sign in with new password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your email to receive a reset code"
              : "Enter the code from your email and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending code..." : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyReset} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We sent a reset code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Reset code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="12345678"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setNewPassword("");
                  setError("");
                }}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/auth/sign-in"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
