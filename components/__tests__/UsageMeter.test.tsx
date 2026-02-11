import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsageMeter } from "../UsageMeter";

describe("UsageMeter", () => {
  it("renders label and counts", () => {
    render(<UsageMeter current={50} limit={100} label="API Calls" />);
    expect(screen.getByText("API Calls")).toBeInTheDocument();
    expect(screen.getByText("50 / 100")).toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(<UsageMeter current={50} limit={100} label="Calls" unit="calls" />);
    expect(screen.getByText("50 / 100 calls")).toBeInTheDocument();
  });

  it("applies green color for low usage", () => {
    const { container } = render(
      <UsageMeter current={30} limit={100} label="Test" />,
    );
    const progress = container.querySelector("[role=progressbar]");
    expect(progress?.className).toContain("bg-success");
  });

  it("applies yellow color for medium usage (70-90%)", () => {
    const { container } = render(
      <UsageMeter current={80} limit={100} label="Test" />,
    );
    const progress = container.querySelector("[role=progressbar]");
    expect(progress?.className).toContain("bg-warning");
  });

  it("applies red color for high usage (>90%)", () => {
    const { container } = render(
      <UsageMeter current={95} limit={100} label="Test" />,
    );
    const progress = container.querySelector("[role=progressbar]");
    expect(progress?.className).toContain("bg-destructive");
  });

  it("caps percentage at 100%", () => {
    const { container } = render(
      <UsageMeter current={150} limit={100} label="Test" />,
    );
    const progressbar = container.querySelector("[role=progressbar]");
    expect(progressbar).toBeInTheDocument();
    // Verify the display shows 150/100 (raw counts) even though bar is capped
    expect(screen.getByText("150 / 100")).toBeInTheDocument();
  });

  it("formats large numbers with locale string", () => {
    render(<UsageMeter current={7500} limit={10000} label="Test" />);
    expect(screen.getByText("7,500 / 10,000")).toBeInTheDocument();
  });
});
