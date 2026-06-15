import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../components/shared/StatusBadge";

describe("StatusBadge", () => {
  it("renders Pending with correct label and data attribute", () => {
    render(<StatusBadge status="Pending" />);
    const node = screen.getByText(/pending/i);
    expect(node).toHaveAttribute("data-status", "Pending");
  });

  it("renders Disetujui with correct label", () => {
    render(<StatusBadge status="Disetujui" />);
    const node = screen.getByText(/disetujui/i);
    expect(node).toHaveAttribute("data-status", "Disetujui");
  });

  it("renders Ditolak with correct label", () => {
    render(<StatusBadge status="Ditolak" />);
    const node = screen.getByText(/ditolak/i);
    expect(node).toHaveAttribute("data-status", "Ditolak");
  });
});
