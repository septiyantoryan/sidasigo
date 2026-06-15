import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "../components/shared/PageHeader";

describe("PageHeader", () => {
  it("renders title as heading", () => {
    render(<PageHeader title="Riset/Kajian" />);
    expect(screen.getByRole("heading", { name: "Riset/Kajian" })).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Berita" description="Kelola berita publik" />);
    expect(screen.getByText("Kelola berita publik")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader title="Unduhan" actions={<button type="button">Tambah</button>} />,
    );
    expect(screen.getByRole("button", { name: /tambah/i })).toBeInTheDocument();
  });
});
