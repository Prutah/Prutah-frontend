import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BudgetBar } from "./BudgetBar";

describe("BudgetBar", () => {
  it("clamps values above 100%", () => {
    render(<BudgetBar pct={142} label="of monthly budget" />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("clamps negative values to 0%", () => {
    render(<BudgetBar pct={-5} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
