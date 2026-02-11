import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable } from "../DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface TestRow {
  name: string;
  email: string;
}

const columns: ColumnDef<TestRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const data: TestRow[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
  { name: "Charlie", email: "charlie@example.com" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders all data rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders search input when searchKey is provided", () => {
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("filters rows when searching", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "Alice");
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("shows pagination controls when pagination is enabled", () => {
    render(<DataTable columns={columns} data={data} pagination pageSize={2} />);
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("paginates data correctly", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} pagination pageSize={2} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();

    await user.click(screen.getByText("Next"));
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("uses custom search placeholder", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Find user..."
      />,
    );
    expect(screen.getByPlaceholderText("Find user...")).toBeInTheDocument();
  });
});
