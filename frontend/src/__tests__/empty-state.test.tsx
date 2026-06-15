import { render, screen } from "@testing-library/react";
import { FileSearch } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "../components/shared/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Belum ada data" />);
    expect(screen.getByText("Belum ada data")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Kosong" description="Tidak ada hasil" />);
    expect(screen.getByText("Tidak ada hasil")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState title="Kosong" action={<button type="button">Coba lagi</button>} />,
    );
    expect(screen.getByRole("button", { name: /coba lagi/i })).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<EmptyState title="Kosong" icon={FileSearch} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
