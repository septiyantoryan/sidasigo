import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JenisBadge } from "../components/shared/JenisBadge";

describe("JenisBadge", () => {
  it("renders Digital with label and data attribute", () => {
    render(<JenisBadge jenis="Digital" />);
    const node = screen.getByText("Digital");
    expect(node).toHaveAttribute("data-jenis", "Digital");
  });

  it("renders Non_Digital with 'Non Digital' label", () => {
    render(<JenisBadge jenis="Non_Digital" />);
    const node = screen.getByText("Non Digital");
    expect(node).toHaveAttribute("data-jenis", "Non_Digital");
  });
});
