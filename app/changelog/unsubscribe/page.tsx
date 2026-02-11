"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "loading" | "success" | "not_found" | "error"
  >("loading");
  const unsubscribe = useMutation(api.changelog.unsubscribe);

  useEffect(() => {
    if (!token) {
      setStatus("not_found");
      return;
    }

    unsubscribe({ token })
      .then((result) => {
        setStatus(result.status === "unsubscribed" ? "success" : "not_found");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token, unsubscribe]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "loading" && "Processing..."}
            {status === "success" && "Unsubscribed"}
            {status === "not_found" && "Invalid Link"}
            {status === "error" && "Something Went Wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-muted-foreground">
              Removing you from the changelog mailing list...
            </p>
          )}
          {status === "success" && (
            <p className="text-muted-foreground">
              You&apos;ve been unsubscribed from changelog updates. You
              won&apos;t receive any more emails from us.
            </p>
          )}
          {status === "not_found" && (
            <p className="text-muted-foreground">
              This unsubscribe link is invalid or has already been used.
            </p>
          )}
          {status === "error" && (
            <p className="text-muted-foreground">
              We couldn&apos;t process your request. Please try again later.
            </p>
          )}

          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/changelog">Back to Changelog</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
