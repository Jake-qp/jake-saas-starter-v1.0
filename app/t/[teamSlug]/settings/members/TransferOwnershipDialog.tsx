"use client";

import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";

export function TransferOwnershipDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const team = useCurrentTeam();
  const candidates = useQuery(
    api.users.teams.ownership.getTransferCandidates,
    team ? { teamId: team._id } : "skip",
  );
  const transferOwnership = useMutation(
    api.users.teams.ownership.transferOwnership,
  );

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const selectedMember = candidates?.find(
    (m) => m.memberId === selectedMemberId,
  );

  const handleTransfer = async () => {
    if (!selectedMemberId || !team) return;
    setIsTransferring(true);
    try {
      await transferOwnership({
        teamId: team._id,
        newOwnerMemberId: selectedMemberId as Id<"members">,
      });
      toast({ title: "Ownership transferred successfully." });
      setOpen(false);
      setSelectedMemberId("");
    } catch (error) {
      toast({
        title:
          error instanceof ConvexError
            ? (error.data as string)
            : "Could not transfer ownership",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Transfer team ownership to another member. You will be demoted to
            Admin. This action cannot be undone without the new owner&apos;s
            consent.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">
            Select new owner
          </label>
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a team member..." />
            </SelectTrigger>
            <SelectContent>
              {candidates?.map((member) => (
                <SelectItem key={member.memberId} value={member.memberId}>
                  <div className="flex flex-col">
                    <span>{member.fullName}</span>
                    <span className="text-muted-foreground text-xs">
                      {member.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMember && (
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-medium text-foreground">
                {selectedMember.fullName}
              </span>{" "}
              will become the new owner and receive full control of this team.
              Both you and the new owner will be notified via email.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleTransfer()}
            disabled={!selectedMemberId || isTransferring}
          >
            {isTransferring ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
