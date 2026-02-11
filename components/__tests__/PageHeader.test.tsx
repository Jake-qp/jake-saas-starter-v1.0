import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Settings" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Settings",
    );
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Settings" description="Manage your team" />);
    expect(screen.getByText("Manage your team")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<PageHeader title="Settings" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders breadcrumbs when provided", () => {
    render(
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "breadcrumb" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Settings")).toHaveLength(2); // breadcrumb + title
  });

  it("renders actions slot", () => {
    render(<PageHeader title="Settings" actions={<button>Save</button>} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("accepts className prop", () => {
    const { container } = render(
      <PageHeader title="Test" className="my-class" />,
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});
