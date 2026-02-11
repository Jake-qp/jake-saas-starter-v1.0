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
import { api } from "@/convex/_generated/api";
import {
  NOTIFICATION_TYPES,
  ALL_NOTIFICATION_TYPES,
  getDefaultPreferences,
  type NotificationType,
} from "@/lib/notificationTypes";
import { useMutation, useQuery } from "convex/react";

export default function NotificationPreferencesPage() {
  const serverPreferences = useQuery(api.notifications.getPreferences);
  const updatePreferences = useMutation(api.notifications.updatePreferences);

  // Use server preferences or defaults while loading
  const preferences = serverPreferences ?? getDefaultPreferences();

  const handleToggle = (type: NotificationType, channel: "email" | "inApp") => {
    const updated = {
      ...preferences,
      [type]: {
        ...preferences[type],
        [channel]: !preferences[type][channel],
      },
    };
    void updatePreferences({ preferences: updated });
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
