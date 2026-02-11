import {
  useCurrentTeam,
  useStalePaginationValue,
  useViewerPermissions,
} from "@/app/t/[teamSlug]/hooks";
import { SelectRole } from "@/app/t/[teamSlug]/settings/members/SelectRole";
import { TransferOwnershipDialog } from "@/app/t/[teamSlug]/settings/members/TransferOwnershipDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  UsePaginatedQueryReturnType,
  useAction,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { useState } from "react";

export function MembersList() {
  const team = useCurrentTeam();
  const viewerPermissions = useViewerPermissions();
  const [search, setSearch] = useState("");
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  const members = usePaginatedQuery(
    api.users.teams.members.list,
    team === undefined ? "skip" : { teamId: team._id, search },
    { initialNumItems: 40 },
  );
  const invites = useQuery(api.users.teams.members.invites.list, {
    teamId: team?._id,
  });

  if (team == null || viewerPermissions == null || invites == null) {
    return null;
  }
  const searchInput = (
    <Input
      className="my-2"
      placeholder="Filter..."
      value={search}
      onChange={(event) => {
        setSearch(event.target.value);
      }}
    />
  );
  return (
    <>
      <Card>
        <CardContent>
          <Tabs defaultValue="members" className="pt-6">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invites">Pending Invites</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              {searchInput}
              <MembersTable
                members={members}
                viewerPermissions={viewerPermissions}
                onTransferOwnership={() => setShowTransferDialog(true)}
              />
            </TabsContent>
            <TabsContent value="invites">
              {searchInput}
              <InvitesTable
                invites={invites}
                search={search}
                viewerPermissions={viewerPermissions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <TransferOwnershipDialog
        open={showTransferDialog}
        setOpen={setShowTransferDialog}
      />
    </>
  );
}

function MembersTable({
  members,
  viewerPermissions,
  onTransferOwnership,
}: {
  members: UsePaginatedQueryReturnType<typeof api.users.teams.members.list>;
  viewerPermissions: NonNullable<ReturnType<typeof useViewerPermissions>>;
  onTransferOwnership: () => void;
}) {
  const updateMember = useMutation(api.users.teams.members.update);
  const deleteMember = useMutation(api.users.teams.members.deleteMember);
  const hasManagePermission = viewerPermissions.has("Manage Members");
  const {
    value: { results, isLoading, status },
    stale,
  } = useStalePaginationValue(members);
  return (
    <div className="flex flex-col">
      <Table>
        <TableBody className={stale ? "animate-pulse" : ""}>
          {results.map((member) => {
            const isOwner = member.roleName === "Owner";
            return (
              <TableRow key={member._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.fullName}</span>
                      {isOwner && (
                        <Badge variant="default" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">{member.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    {isOwner ? (
                      <span className="text-sm text-muted-foreground">
                        Owner
                      </span>
                    ) : (
                      <SelectRole
                        disabled={!hasManagePermission || isOwner}
                        value={member.roleId}
                        onChange={(roleId) => {
                          updateMember({ memberId: member._id, roleId }).catch(
                            (error) => {
                              toast({
                                title:
                                  error instanceof ConvexError
                                    ? error.data
                                    : "Could not update role",
                                variant: "destructive",
                              });
                            },
                          );
                        }}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell width={10}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={!hasManagePermission}
                        variant="ghost"
                        size="icon"
                      >
                        <DotsHorizontalIcon className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end">
                      {isOwner ? (
                        <DropdownMenuItem onSelect={onTransferOwnership}>
                          Transfer Ownership
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={() => {
                            deleteMember({ memberId: member._id }).catch(
                              (error) => {
                                toast({
                                  title:
                                    error instanceof ConvexError
                                      ? error.data
                                      : "Could not delete member",
                                  variant: "destructive",
                                });
                              },
                            );
                          }}
                        >
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {isLoading ? (
        <Skeleton className="h-8 animate-pulse" />
      ) : status === "Exhausted" ? (
        results.length === 0 ? (
          <div className="text-muted-foreground text-sm py-2 text-center">
            No results found
          </div>
        ) : null
      ) : (
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => {
            members.loadMore(40);
          }}
        >
          Load more
        </Button>
      )}
    </div>
  );
}

function formatInviteAge(creationTime: number): string {
  const diffMs = Date.now() - creationTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}

function InvitesTable({
  invites,
  search,
  viewerPermissions,
}: {
  invites: NonNullable<
    FunctionReturnType<typeof api.users.teams.members.invites.list>
  >;
  search: string;
  viewerPermissions: NonNullable<ReturnType<typeof useViewerPermissions>>;
}) {
  const deleteInvite = useMutation(
    api.users.teams.members.invites.deleteInvite,
  );
  const resendInvite = useAction(api.users.teams.members.invites.send);
  const team = useCurrentTeam();
  const hasManagePermission = viewerPermissions.has("Manage Members");
  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-muted-foreground text-sm">
          There are no pending invites
        </div>
      </div>
    );
  }
  return (
    <Table>
      <TableBody>
        {invites
          .filter((invite) => invite.email.includes(search))
          .map((invite) => {
            const isExpired =
              invite._creationTime !== undefined &&
              Date.now() - invite._creationTime > 7 * 24 * 60 * 60 * 1000;
            return (
              <TableRow key={invite._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      {isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                    {invite._creationTime !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Sent {formatInviteAge(invite._creationTime)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">{invite.role}</div>
                </TableCell>
                <TableCell width={10}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={!hasManagePermission}
                        variant="ghost"
                        size="icon"
                      >
                        <DotsHorizontalIcon className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          if (!team) return;
                          void resendInvite({
                            teamId: team._id,
                            email: invite.email,
                            roleId: invite.roleId,
                          })
                            .then(() => {
                              toast({ title: "Invite resent." });
                            })
                            .catch((error) => {
                              toast({
                                title:
                                  error instanceof ConvexError
                                    ? error.data
                                    : "Could not resend invite",
                                variant: "destructive",
                              });
                            });
                        }}
                      >
                        Resend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          void deleteInvite({ inviteId: invite._id });
                        }}
                      >
                        Revoke
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
