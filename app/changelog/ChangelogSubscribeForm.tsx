"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data for Phase 2 visual design — will be replaced with Convex mutation in Phase 4
const MOCK_SUBSCRIBED_EMAILS = ["already@example.com"];

export function ChangelogSubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "success" | "already_subscribed" | "error"
  >("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Mock: check for duplicate
    if (MOCK_SUBSCRIBED_EMAILS.includes(email)) {
      setStatus("already_subscribed");
      return;
    }

    setStatus("success");
    setEmail("");
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium">Get notified of updates</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Subscribe to receive an email when we publish new changelog entries.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          required
          className="max-w-xs"
        />
        <Button type="submit" size="sm">
          Subscribe
        </Button>
      </form>

      {status === "success" && (
        <p className="mt-2 text-sm text-success">
          You&apos;re subscribed! We&apos;ll email you when we have updates.
        </p>
      )}
      {status === "already_subscribed" && (
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re already subscribed to changelog updates.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
