import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PricingCard } from "../PricingCard";

describe("PricingCard", () => {
  const defaultProps = {
    name: "Pro",
    price: "$29/mo",
    features: ["Feature 1", "Feature 2"],
  };

  it("renders plan name and price", () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("$29/mo")).toBeInTheDocument();
  });

  it("renders all features", () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByText("Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Feature 2")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PricingCard {...defaultProps} description="For growing teams" />);
    expect(screen.getByText("For growing teams")).toBeInTheDocument();
  });

  it("renders CTA when provided", () => {
    render(
      <PricingCard {...defaultProps} cta={<button>Get Started</button>} />,
    );
    expect(
      screen.getByRole("button", { name: "Get Started" }),
    ).toBeInTheDocument();
  });

  it("applies highlighted styles", () => {
    const { container } = render(<PricingCard {...defaultProps} highlighted />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("ring-primary");
  });

  it("does not apply highlighted styles by default", () => {
    const { container } = render(<PricingCard {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("ring-primary");
  });
});
