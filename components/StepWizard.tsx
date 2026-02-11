"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";

export interface Step {
  label: string;
  description?: string;
}

export interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Multi-step wizard with horizontal step indicator.
 * Steps are 0-indexed. Completed steps are clickable for navigation.
 *
 * @example
 * const [step, setStep] = useState(0);
 * <StepWizard
 *   steps={[
 *     { label: "Account", description: "Create your account" },
 *     { label: "Profile", description: "Set up your profile" },
 *     { label: "Complete", description: "All done!" },
 *   ]}
 *   currentStep={step}
 *   onStepChange={setStep}
 * >
 *   {step === 0 && <AccountForm />}
 *   {step === 1 && <ProfileForm />}
 *   {step === 2 && <CompletionScreen />}
 * </StepWizard>
 */
export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  className,
}: StepWizardProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li
                key={step.label}
                className={cn(
                  "relative flex-1",
                  index < steps.length - 1 && "pr-4",
                )}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => isCompleted && onStepChange?.(index)}
                    disabled={!isCompleted}
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      isCompleted &&
                        "bg-primary text-primary-foreground cursor-pointer",
                      isCurrent &&
                        "border-2 border-primary bg-background text-primary",
                      !isCompleted &&
                        !isCurrent &&
                        "border-2 border-muted bg-background text-muted-foreground",
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "ml-2 h-0.5 flex-1",
                        isCompleted ? "bg-primary" : "bg-muted",
                      )}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
      <div>{children}</div>
    </div>
  );
}
