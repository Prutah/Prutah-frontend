import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
}

describe("DataTable", () => {
  it("renders an empty state when there are no rows", () => {
    render(
      <DataTable<Row>
        rows={[]}
        rowKey={(r) => r.id}
        emptyLabel="Nothing here"
        columns={[{ header: "Name", cell: (r) => r.name }]}
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders a row per item", () => {
    render(
      <DataTable<Row>
        rows={[{ id: "1", name: "agent-x" }]}
        rowKey={(r) => r.id}
        columns={[{ header: "Name", cell: (r) => r.name }]}
      />,
    );
    expect(screen.getByText("agent-x")).toBeInTheDocument();
  });
});
