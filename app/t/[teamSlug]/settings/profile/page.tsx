"use client";

import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { SettingsMenuButton } from "@/app/t/[teamSlug]/settings/SettingsMenuButton";
import { AvatarUpload } from "@/components/AvatarUpload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect, useCallback } from "react";

// Common IANA timezones
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/Mexico_City",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
] as const;

export default function ProfileSettingsPage() {
  const user = useQuery(api.users.viewer);
  const sessions = useQuery(api.users.listSessions);
  const updateProfile = useMutation(api.users.updateProfile);
  const invalidateOtherSessions = useMutation(
    api.sessions.invalidateOtherSessions,
  );
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveUserAvatar = useMutation(api.storage.saveUserAvatar);
  const removeUserAvatar = useMutation(api.storage.removeUserAvatar);
  const team = useCurrentTeam();

  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [invalidating, setInvalidating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setTimezone(
        user.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    void updateProfile({ fullName, timezone })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .finally(() => setSaving(false));
  };

  const handleLogoutOtherDevices = () => {
    setInvalidating(true);
    void invalidateOtherSessions({}).finally(() => setInvalidating(false));
  };

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!team) return;
      setUploadingAvatar(true);
      try {
        const uploadUrl = await generateUploadUrl({ teamId: team._id });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!result.ok) throw new Error("Upload failed");
        const { storageId } = await result.json();
        await saveUserAvatar({
          teamId: team._id,
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      } catch (error) {
        console.error("Avatar upload failed:", error);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [team, generateUploadUrl, saveUserAvatar],
  );

  const handleAvatarRemove = useCallback(async () => {
    try {
      await removeUserAvatar({});
    } catch (error) {
      console.error("Avatar removal failed:", error);
    }
  }, [removeUserAvatar]);

  if (!user) return null;

  const userInitials = (user.fullName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="flex items-center mt-8">
        <SettingsMenuButton />
        <h1 className="text-4xl font-extrabold">Profile Settings</h1>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>
            Upload a profile picture. Max 2 MB, images only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={user.pictureUrl}
            fallback={userInitials}
            onUpload={(file) => void handleAvatarUpload(file)}
            onRemove={
              user.pictureUrl ? () => void handleAvatarRemove() : undefined
            }
            disabled={uploadingAvatar}
            label={uploadingAvatar ? "Uploading..." : undefined}
          />
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email ?? ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Display name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions === null || sessions === undefined ? (
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Session {index + 1}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-primary">
                          (current)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(session._creationTime).toLocaleString(
                        undefined,
                        { timeZone: timezone || undefined },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {sessions && sessions.length > 1 && (
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleLogoutOtherDevices}
              disabled={invalidating}
            >
              {invalidating ? "Logging out..." : "Log out all other devices"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
