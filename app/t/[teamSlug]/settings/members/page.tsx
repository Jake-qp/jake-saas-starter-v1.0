"use client";

import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { AddMember } from "@/app/t/[teamSlug]/settings/members/AddMember";
import { MembersList } from "@/app/t/[teamSlug]/settings/members/MemberList";
import { CustomRolesCard } from "@/app/t/[teamSlug]/settings/members/CustomRolesCard";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MembersPage() {
  const team = useCurrentTeam();
  const router = useRouter();
  const billing = useQuery(
    api.billing.getTeamBilling,
    team?._id ? { teamId: team._id } : "skip",
  );
  useEffect(() => {
    if (team?.isPersonal === true) {
      router.replace(`/t/${team.slug}/settings`);
    }
  }, [team, router]);
  return (
    <>
      <h1 className="text-4xl font-extrabold mt-8">Members</h1>

      <AddMember />
      <MembersList />
      <CustomRolesCard isEnterprise={billing?.tier === "enterprise"} />
    </>
  );
}
