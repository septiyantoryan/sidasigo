import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BeritaCard } from "../components/berita/BeritaCard";
import type { Berita } from "../types";

const item: Berita = {
  id: "b1",
  posterPath: "/api/public-files/poster.jpg",
  caption: "Pemkab Grobogan meluncurkan program inovasi pelayanan publik.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(data: Berita) {
  return render(
    <MemoryRouter>
      <BeritaCard item={data} />
    </MemoryRouter>,
  );
}

describe("BeritaCard", () => {
  it("renders caption and poster", () => {
    renderCard(item);
    expect(
      screen.getByText(/pemkab grobogan meluncurkan program/i),
    ).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("/api/public-files/poster.jpg");
  });

  it("links to the detail page", () => {
    renderCard(item);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/berita/b1");
  });
});
