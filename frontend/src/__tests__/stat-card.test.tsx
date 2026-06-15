import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "../components/shared/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Inovasi" value={42} />);
    expect(screen.getByText("Total Inovasi")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<StatCard label="Pending" value={3} description="Menunggu review" />);
    expect(screen.getByText("Menunggu review")).toBeInTheDocument();
  });
});
