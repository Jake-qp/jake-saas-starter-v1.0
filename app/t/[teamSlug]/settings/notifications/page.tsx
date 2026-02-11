"use client";

import { SettingsMenuButton } from "@/app/t/[teamSlug]/settings/SettingsMenuButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  NOTIFICATION_TYPES,
  ALL_NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/notificationTypes";
import { useState } from "react";

// Mock preferences for Phase 2 visual design — will be replaced in Phase 4
const MOCK_PREFERENCES: Record<
  NotificationType,
  { email: boolean; inApp: boolean }
> = Object.fromEntries(
  ALL_NOTIFICATION_TYPES.map((type) => [
    type,
    {
      email: NOTIFICATION_TYPES[type].defaultEmail,
      inApp: NOTIFICATION_TYPES[type].defaultInApp,
    },
  ]),
) as Record<NotificationType, { email: boolean; inApp: boolean }>;

export default function NotificationPreferencesPage() {
  // Phase 2: Local state with mock data
  // Phase 4: Replace with Convex query + mutation
  const [preferences, setPreferences] =
    useState<Record<NotificationType, { email: boolean; inApp: boolean }>>(
      MOCK_PREFERENCES,
    );

  const handleToggle = (type: NotificationType, channel: "email" | "inApp") => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel],
      },
    }));
  };

  return (
    <>
      <div className="flex items-center mt-8">
        <SettingsMenuButton />
        <h1 className="text-4xl font-extrabold">Notification Preferences</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email & In-App Notifications</CardTitle>
          <CardDescription>
            Choose how you want to be notified for each type of event. In-app
            notifications appear in the bell icon in the header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Column headers */}
            <div className="flex items-center justify-end gap-8 pr-1">
              <span className="text-xs font-medium text-muted-foreground w-12 text-center">
                Email
              </span>
              <span className="text-xs font-medium text-muted-foreground w-12 text-center">
                In-App
              </span>
            </div>

            {ALL_NOTIFICATION_TYPES.map((type) => {
              const config = NOTIFICATION_TYPES[type];
              const pref = preferences[type];
              return (
                <div
                  key={type}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="w-12 flex justify-center">
                      <Switch
                        checked={pref.email}
                        onCheckedChange={() => handleToggle(type, "email")}
                        aria-label={`${config.label} email notifications`}
                      />
                    </div>
                    <div className="w-12 flex justify-center">
                      <Switch
                        checked={pref.inApp}
                        onCheckedChange={() => handleToggle(type, "inApp")}
                        aria-label={`${config.label} in-app notifications`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
