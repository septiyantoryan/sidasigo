import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RisetCard } from "../components/riset/RisetCard";
import type { Riset } from "../types";

const item: Riset = {
  id: "r1",
  judulKajian: "Riset Pertanian Presisi",
  timPeneliti: "Dr. Andi, Budi S.Si",
  tahunPublikasi: 2024,
  abstrak: "Abstrak singkat riset.",
  filePath: "/api/public-files/riset.pdf",
  jenis: "RisetKajian",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(data: Riset) {
  return render(
    <MemoryRouter>
      <RisetCard item={data} />
    </MemoryRouter>,
  );
}

describe("RisetCard", () => {
  it("renders title, team, year, and jenis", () => {
    renderCard(item);
    expect(screen.getByText("Riset Pertanian Presisi")).toBeInTheDocument();
    expect(screen.getByText("Dr. Andi, Budi S.Si")).toBeInTheDocument();
    expect(screen.getAllByText("2024").length).toBeGreaterThan(0);
    expect(screen.getByText("Riset/Kajian")).toBeInTheDocument();
  });

  it("links the card to the public detail page", () => {
    renderCard(item);
    const link = screen.getByRole("link", { name: /riset pertanian presisi/i });
    expect(link.getAttribute("href")).toBe("/riset/r1");
    expect(screen.queryByRole("link", { name: /unduh dokumen/i })).not.toBeInTheDocument();
  });

  it("renders Penelitian badge for penelitian items", () => {
    renderCard({ ...item, id: "k1", jenis: "Penelitian" });
    expect(screen.getByText("Penelitian")).toBeInTheDocument();
  });

  it("renders Policy Brief outline badge", () => {
    renderCard({ ...item, id: "p1", jenis: "PolicyBrief" });
    expect(screen.getByText("Policy Brief")).toHaveClass("border");
  });
});
