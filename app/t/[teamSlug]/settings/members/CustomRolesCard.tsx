"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LockClosedIcon } from "@radix-ui/react-icons";

// MOCK DATA — Phase 2 visual validation only
// In Phase 4, this will use real tier from billing context
export function CustomRolesCard({
  isEnterprise = false,
}: {
  isEnterprise?: boolean;
}) {
  if (!isEnterprise) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Custom Roles</CardTitle>
            <Badge variant="secondary">
              <LockClosedIcon className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
          </div>
          <CardDescription>
            Create custom roles with fine-grained permissions for your team.
            Available on the Enterprise plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/settings/billing">Upgrade to Enterprise</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Roles</CardTitle>
        <CardDescription>
          Create and manage custom roles for your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No custom roles yet. Create one to get started.
        </p>
        <Button className="mt-4">Create Custom Role</Button>
      </CardContent>
    </Card>
  );
}
