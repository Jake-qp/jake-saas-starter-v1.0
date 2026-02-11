"use client";

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
import { useState } from "react";
import {
  RocketIcon,
  PersonIcon,
  GearIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

// MOCK DATA — Phase 2 only, will be replaced with real Convex backend in Phase 4
const MOCK_USER = {
  fullName: "",
  email: "alex@example.com",
};

const ONBOARDING_STEPS = [
  { label: "Profile", description: "Set up your profile" },
  { label: "Team", description: "Name your workspace" },
  { label: "Get Started", description: "You're all set!" },
];

function ProfileStep({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  const [fullName, setFullName] = useState(MOCK_USER.fullName);

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
            value={MOCK_USER.email}
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
        <Button onClick={onNext} disabled={!fullName.trim()}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}

function TeamStep({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [teamName, setTeamName] = useState("");

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
        <Button onClick={onNext}>Continue</Button>
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
  const [currentStep, setCurrentStep] = useState(0);

  const handleSkip = () => {
    // MOCK: In Phase 4, this will call a mutation to mark onboarding as skipped
    // and redirect to dashboard
    setCurrentStep(ONBOARDING_STEPS.length - 1);
  };

  const handleFinish = () => {
    // MOCK: In Phase 4, this will call a mutation to mark onboarding as complete
    // and redirect to dashboard
    alert("Onboarding complete! (mock — will redirect to dashboard)");
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
        steps={ONBOARDING_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      >
        {currentStep === 0 && (
          <ProfileStep onNext={() => setCurrentStep(1)} onSkip={handleSkip} />
        )}
        {currentStep === 1 && (
          <TeamStep
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
            onSkip={handleSkip}
          />
        )}
        {currentStep === 2 && <CompletionStep onFinish={handleFinish} />}
      </StepWizard>
    </main>
  );
}
