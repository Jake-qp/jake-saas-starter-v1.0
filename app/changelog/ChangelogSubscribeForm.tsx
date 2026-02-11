"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangelogSubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "already_subscribed" | "error"
  >("idle");
  const subscribe = useMutation(api.changelog.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const result = await subscribe({ email });
      if (result.status === "already_subscribed") {
        setStatus("already_subscribed");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium">Get notified of updates</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Subscribe to receive an email when we publish new changelog entries.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-3 flex gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          required
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
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
