import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders default label for each status", () => {
    const statuses = [
      { status: "active" as const, label: "Active" },
      { status: "trialing" as const, label: "Trialing" },
      { status: "past_due" as const, label: "Past Due" },
      { status: "canceled" as const, label: "Canceled" },
      { status: "inactive" as const, label: "Inactive" },
      { status: "pending" as const, label: "Pending" },
    ];

    for (const { status, label } of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders custom label when provided", () => {
    render(<StatusBadge status="past_due" label="Payment Required" />);
    expect(screen.getByText("Payment Required")).toBeInTheDocument();
  });

  it("applies success styles for active status", () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("bg-success");
  });

  it("applies warning styles for past_due status", () => {
    render(<StatusBadge status="past_due" />);
    const badge = screen.getByText("Past Due");
    expect(badge.className).toContain("bg-warning");
  });

  it("applies destructive styles for canceled status", () => {
    render(<StatusBadge status="canceled" />);
    const badge = screen.getByText("Canceled");
    expect(badge.className).toContain("bg-destructive");
  });

  it("accepts className prop", () => {
    render(<StatusBadge status="active" className="ml-2" />);
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("ml-2");
  });
});
