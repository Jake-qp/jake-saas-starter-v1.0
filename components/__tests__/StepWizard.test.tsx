import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StepWizard } from "../StepWizard";

const steps = [
  { label: "Account" },
  { label: "Profile", description: "Set up your profile" },
  { label: "Complete" },
];

describe("StepWizard", () => {
  it("renders all step labels", () => {
    render(
      <StepWizard steps={steps} currentStep={0}>
        <div>Content</div>
      </StepWizard>,
    );
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <StepWizard steps={steps} currentStep={0}>
        <div>Step content here</div>
      </StepWizard>,
    );
    expect(screen.getByText("Step content here")).toBeInTheDocument();
  });

  it("marks current step with aria-current", () => {
    render(
      <StepWizard steps={steps} currentStep={1}>
        <div>Content</div>
      </StepWizard>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toHaveAttribute("aria-current", "step");
  });

  it("allows clicking completed steps", async () => {
    const onStepChange = vi.fn();
    const user = userEvent.setup();
    render(
      <StepWizard steps={steps} currentStep={2} onStepChange={onStepChange}>
        <div>Content</div>
      </StepWizard>,
    );
    await user.click(screen.getAllByRole("button")[0]);
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it("disables future step buttons", () => {
    render(
      <StepWizard steps={steps} currentStep={0}>
        <div>Content</div>
      </StepWizard>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });

  it("renders step description", () => {
    render(
      <StepWizard steps={steps} currentStep={1}>
        <div>Content</div>
      </StepWizard>,
    );
    expect(screen.getByText("Set up your profile")).toBeInTheDocument();
  });
});
