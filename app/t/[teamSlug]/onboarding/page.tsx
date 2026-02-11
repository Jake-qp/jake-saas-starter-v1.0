"use client";

import { useCurrentTeam } from "@/app/t/[teamSlug]/hooks";
import { StepWizard } from "@/components/StepWizard";
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
import { api } from "@/convex/_generated/api";
import { ONBOARDING_STEPS, needsOnboarding } from "@/lib/onboardingConfig";
import {
  RocketIcon,
  PersonIcon,
  GearIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const WIZARD_STEPS = ONBOARDING_STEPS.map((s) => ({
  label: s.label,
  description: s.description,
}));

function ProfileStep({
  email,
  initialName,
  onNext,
  onSkip,
}: {
  email: string;
  initialName: string;
  onNext: (name: string) => void;
  onSkip: () => void;
}) {
  const [fullName, setFullName] = useState(initialName);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PersonIcon className="h-5 w-5 text-primary" />
          <CardTitle>Welcome! Let{"'"}s set up your profile</CardTitle>
        </div>
        <CardDescription>
          Tell us your name so your teammates know who you are.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="onboarding-email">Email</Label>
          <Input
            id="onboarding-email"
            type="email"
            value={email}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onboarding-name">Display name</Label>
          <Input
            id="onboarding-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip onboarding
        </Button>
        <Button
          onClick={() => onNext(fullName.trim())}
          disabled={!fullName.trim()}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}

function TeamStep({
  initialTeamName,
  onNext,
  onBack,
  onSkip,
}: {
  initialTeamName: string;
  onNext: (teamName: string) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [teamName, setTeamName] = useState(initialTeamName);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GearIcon className="h-5 w-5 text-primary" />
          <CardTitle>Name your workspace</CardTitle>
        </div>
        <CardDescription>
          You can always change this later in settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="onboarding-team">Workspace name</Label>
          <Input
            id="onboarding-team"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Acme Corp"
            autoFocus
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        </div>
        <Button onClick={() => onNext(teamName.trim())}>Continue</Button>
      </CardFooter>
    </Card>
  );
}

function CompletionStep({ onFinish }: { onFinish: () => void }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircledIcon className="h-6 w-6 text-success" />
        </div>
        <CardTitle>You{"'"}re all set!</CardTitle>
        <CardDescription>
          Your workspace is ready. You can explore the dashboard, invite team
          members, or adjust settings anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <RocketIcon className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Explore the dashboard</p>
              <p className="text-xs text-muted-foreground">
                See what you can build with your new workspace
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <PersonIcon className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Invite your team</p>
              <p className="text-xs text-muted-foreground">
                Add members from Settings &rarr; Members
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <GearIcon className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Configure settings</p>
              <p className="text-xs text-muted-foreground">
                Billing, notifications, and more
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button size="lg" onClick={onFinish}>
          Go to dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function OnboardingPage() {
  const user = useQuery(api.users.viewer);
  const onboardingStatus = useQuery(api.onboarding.getStatus);
  const team = useCurrentTeam();
  const router = useRouter();

  const updateStep = useMutation(api.onboarding.updateStep);
  const completeOnboarding = useMutation(api.onboarding.complete);
  const skipOnboarding = useMutation(api.onboarding.skip);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateTeamName = useMutation(api.users.teams.update);

  const currentStep = onboardingStatus?.onboardingStep ?? 0;

  // If onboarding is already done, redirect to dashboard
  useEffect(() => {
    if (
      user &&
      team &&
      onboardingStatus !== undefined &&
      !needsOnboarding(onboardingStatus?.onboardingStatus)
    ) {
      router.replace(`/t/${team.slug}`);
    }
  }, [user, team, onboardingStatus, router]);

  if (!user || !team || onboardingStatus === undefined) {
    return null;
  }

  // Already completed — don't flash wizard while redirecting
  if (!needsOnboarding(onboardingStatus?.onboardingStatus)) {
    return null;
  }

  const goToStep = async (step: number) => {
    await updateStep({ step });
  };

  const handleProfileNext = async (name: string) => {
    await updateProfile({ fullName: name });
    await goToStep(1);
  };

  const handleTeamNext = async (teamName: string) => {
    if (teamName) {
      await updateTeamName({ teamId: team._id, name: teamName });
    }
    await goToStep(2);
  };

  const handleSkip = async () => {
    await skipOnboarding({});
    router.replace(`/t/${team.slug}`);
  };

  const handleFinish = async () => {
    await completeOnboarding({});
    router.replace(`/t/${team.slug}`);
  };

  return (
    <main className="container max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Get Started</h1>
        <p className="text-muted-foreground">
          Set up your workspace in a few quick steps
        </p>
      </div>

      <StepWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={(step) => void goToStep(step)}
      >
        {currentStep === 0 && (
          <ProfileStep
            email={user.email ?? ""}
            initialName={user.fullName ?? ""}
            onNext={(name) => void handleProfileNext(name)}
            onSkip={() => void handleSkip()}
          />
        )}
        {currentStep === 1 && (
          <TeamStep
            initialTeamName={team.name}
            onNext={(name) => void handleTeamNext(name)}
            onBack={() => void goToStep(0)}
            onSkip={() => void handleSkip()}
          />
        )}
        {currentStep === 2 && (
          <CompletionStep onFinish={() => void handleFinish()} />
        )}
      </StepWizard>
    </main>
  );
}
