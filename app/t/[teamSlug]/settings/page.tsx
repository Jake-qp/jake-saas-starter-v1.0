"use client";

import { useCurrentTeam, useViewerPermissions } from "@/app/t/[teamSlug]/hooks";
import { DeleteTeamDialog } from "@/app/t/[teamSlug]/settings/DeleteTeamDialog";
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
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState, useCallback } from "react";

export default function GeneralSettingsPage() {
  const team = useCurrentTeam();
  const permissions = useViewerPermissions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveTeamAvatar = useMutation(api.storage.saveTeamAvatar);
  const removeTeamAvatar = useMutation(api.storage.removeTeamAvatar);
  const teamAvatarUrl = useQuery(
    api.storage.getFileUrl,
    team?.avatarStorageId ? { storageId: team.avatarStorageId } : "skip",
  );

  const handleTeamAvatarUpload = useCallback(
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
        await saveTeamAvatar({
          teamId: team._id,
          storageId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      } catch (error) {
        console.error("Team avatar upload failed:", error);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [team, generateUploadUrl, saveTeamAvatar],
  );

  const handleTeamAvatarRemove = useCallback(async () => {
    if (!team) return;
    try {
      await removeTeamAvatar({ teamId: team._id });
    } catch (error) {
      console.error("Team avatar removal failed:", error);
    }
  }, [team, removeTeamAvatar]);

  if (team == null || permissions == null) {
    return null;
  }

  const openDeleteTeamDialog = () => {
    setShowDeleteDialog(true);
  };

  const teamInitials = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="flex items-center mt-8">
        <SettingsMenuButton />
        <h1 className="text-4xl font-extrabold">
          {team.isPersonal ? <>Account Settings</> : <>Team Settings</>}
        </h1>
      </div>

      {/* Team Avatar (non-personal teams only) */}
      {!team.isPersonal && (
        <Card>
          <CardHeader>
            <CardTitle>Team Avatar</CardTitle>
            <CardDescription>
              Upload a team avatar. Max 2 MB, images only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              currentAvatarUrl={teamAvatarUrl ?? null}
              fallback={teamInitials}
              onUpload={(file) => void handleTeamAvatarUpload(file)}
              onRemove={
                team.avatarStorageId
                  ? () => void handleTeamAvatarRemove()
                  : undefined
              }
              disabled={uploadingAvatar}
              label={uploadingAvatar ? "Uploading..." : undefined}
            />
          </CardContent>
        </Card>
      )}

      <Card disabled={!permissions.has("Delete Team")}>
        {team.isPersonal ? (
          <>
            <CardHeader>
              <CardTitle>Delete Personal Account</CardTitle>
              <CardDescription>
                Permanently delete your account and leave all your teams. This
                action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={openDeleteTeamDialog} variant="destructive">
                Delete Personal Account
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Delete Team</CardTitle>
              <CardDescription>
                Permanently delete this team. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                disabled={!permissions.has("Delete Team")}
                onClick={openDeleteTeamDialog}
                variant="destructive"
              >
                Delete Team
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
      <DeleteTeamDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} />
    </>
  );
}
