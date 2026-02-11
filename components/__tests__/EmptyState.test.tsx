import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No items" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="No items" description="Create your first item." />,
    );
    expect(screen.getByText("Create your first item.")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="No items"
        icon={<span data-testid="test-icon">Icon</span>}
      />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(<EmptyState title="No items" action={<button>Create</button>} />);
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders minimal state with title only", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector("h3")).toHaveTextContent("Empty");
  });

  it("accepts className prop", () => {
    const { container } = render(
      <EmptyState title="Test" className="my-class" />,
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});
