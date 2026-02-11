"use client";

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
import { useState } from "react";

// MOCK DATA — Phase 2 visual validation only
const MOCK_MEMBERS = [
  { _id: "m1" as never, fullName: "Alice Chen", email: "alice@example.com" },
  { _id: "m2" as never, fullName: "Bob Martinez", email: "bob@example.com" },
  { _id: "m3" as never, fullName: "Carol Davis", email: "carol@example.com" },
];

export function TransferOwnershipDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const selectedMember = MOCK_MEMBERS.find((m) => m._id === selectedMemberId);

  const handleTransfer = async () => {
    if (!selectedMemberId) return;
    setIsTransferring(true);
    // Mock: simulate transfer
    setTimeout(() => {
      setIsTransferring(false);
      setOpen(false);
    }, 1000);
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
              {MOCK_MEMBERS.map((member) => (
                <SelectItem key={member._id} value={member._id}>
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
