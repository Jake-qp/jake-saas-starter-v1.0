"use client";

import { handleFailure } from "@/app/handleFailure";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { BellIcon } from "@radix-ui/react-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

// Mock data for Phase 2 visual design — will be replaced in Phase 4
const MOCK_NOTIFICATIONS = [
  {
    _id: "mock-1" as never,
    type: "invite_sent" as const,
    title: "Team Invitation",
    body: "John Doe invited you to join Acme Corp",
    isRead: false,
    _creationTime: Date.now() - 1000 * 60 * 5, // 5 min ago
  },
  {
    _id: "mock-2" as never,
    type: "subscription_changed" as const,
    title: "Subscription Upgraded",
    body: "Acme Corp has been upgraded to Pro plan",
    isRead: false,
    _creationTime: Date.now() - 1000 * 60 * 30, // 30 min ago
  },
  {
    _id: "mock-3" as never,
    type: "approaching_limit" as const,
    title: "Usage Alert",
    body: "Acme Corp has used 80% of AI Credits",
    isRead: true,
    _creationTime: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    _id: "mock-4" as never,
    type: "payment_received" as const,
    title: "Payment Received",
    body: "$29.00 payment for Pro plan processed",
    isRead: true,
    _creationTime: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Notifications() {
  const router = useRouter();
  const invites = useQuery(api.invites.list);
  const acceptInvite = useMutation(api.invites.accept);

  // Phase 2: Use mock data for visual validation
  // Phase 4: Replace with real Convex query
  const notifications = MOCK_NOTIFICATIONS;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const inviteCount = (invites ?? []).length;
  const totalUnread = unreadCount + inviteCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full relative w-8 h-8"
        >
          <BellIcon className="w-4 h-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
        </div>
        <DropdownMenuSeparator />

        {/* Pending invites section */}
        {invites?.map((invite, i) => (
          <Fragment key={invite._id}>
            <DropdownMenuItem
              onSelect={handleFailure(async () => {
                const teamSlug = await acceptInvite({ inviteId: invite._id });
                router.push(`/t/${teamSlug}`);
              })}
              className="flex flex-col items-start gap-1 p-3"
            >
              <p className="text-sm font-medium">Team Invitation</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {invite.inviterEmail}
                </span>{" "}
                invited you to join{" "}
                <span className="font-medium text-foreground">
                  {invite.team}
                </span>
              </p>
              <span className="text-xs text-primary">Click to accept</span>
            </DropdownMenuItem>
            {i < invites.length - 1 || notifications.length > 0 ? (
              <DropdownMenuSeparator />
            ) : null}
          </Fragment>
        )) ?? <Skeleton className="w-full h-10 mx-3" />}

        {/* In-app notifications */}
        {notifications.length === 0 && inviteCount === 0 ? (
          <div className="px-3 py-8 text-center">
            <BellIcon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((notification, i) => (
            <Fragment key={notification._id}>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex w-full items-center justify-between">
                  <p
                    className={`text-sm ${notification.isRead ? "text-muted-foreground" : "font-medium"}`}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.body}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {formatRelativeTime(notification._creationTime)}
                </p>
              </DropdownMenuItem>
              {i < notifications.length - 1 && <DropdownMenuSeparator />}
            </Fragment>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
