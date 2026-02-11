"use client";

import { MessageBoard } from "@/app/t/[teamSlug]/MessageBoard";
import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { needsOnboarding } from "@/lib/onboardingConfig";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const team = useCurrentTeam();
  const user = useQuery(api.users.viewer);
  const router = useRouter();

  // Redirect to onboarding if user hasn't completed it yet
  useEffect(() => {
    if (user && team && needsOnboarding(user.onboardingStatus)) {
      router.replace(`/t/${team.slug}/onboarding`);
    }
  }, [user, team, router]);

  if (team == null) {
    return null;
  }

  // Don't flash dashboard content while redirecting to onboarding
  if (user && needsOnboarding(user.onboardingStatus)) {
    return null;
  }

  return (
    <main className="container">
      <h1 className="text-4xl font-extrabold my-8">
        {team.name}
        {"'"}s Projects
      </h1>
      <p>This is where your product actually lives.</p>
      <p>As an example, here{"'"}s a message board for the team:</p>
      <MessageBoard />
    </main>
  );
}
