"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RocketIcon, CheckCircledIcon } from "@radix-ui/react-icons";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "duplicate" | "error"
  >("idle");

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const waitlistCount = useQuery(api.waitlist.getWaitlistCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const result = await joinWaitlist({ email });
      if (result.status === "duplicate") {
        setStatus("duplicate");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <RocketIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            We&apos;re launching soon
          </h1>
          <p className="text-lg text-muted-foreground">
            Join the waitlist to be among the first to try our platform.
            We&apos;ll send you an invitation when your spot is ready.
          </p>
        </div>

        {status === "success" ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircledIcon className="h-6 w-6 text-success" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  You&apos;re on the list!
                </h2>
                <p className="text-muted-foreground">
                  We&apos;ll send an invitation to <strong>{email}</strong> when
                  your spot is ready.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Join the waitlist</CardTitle>
              <CardDescription>
                Enter your email to reserve your spot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Email address</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "duplicate" || status === "error") {
                        setStatus("idle");
                      }
                    }}
                    required
                    disabled={status === "submitting"}
                  />
                </div>

                {status === "duplicate" && (
                  <p className="text-sm text-muted-foreground">
                    This email is already on the waitlist. We&apos;ll be in
                    touch!
                  </p>
                )}

                {status === "error" && (
                  <p className="text-sm text-destructive">
                    Something went wrong. Please try again.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Joining..." : "Join waitlist"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {waitlistCount !== undefined && waitlistCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {waitlistCount.toLocaleString()} people already on the waitlist
          </p>
        )}
      </div>
    </div>
  );
}
