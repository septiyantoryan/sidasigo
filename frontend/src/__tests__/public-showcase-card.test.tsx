import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PublicShowcaseCard } from "../components/public/PublicShowcaseCard";
import type { InovasiDaerah, Krenova } from "../types";

const inovasi: InovasiDaerah = {
  id: "i1",
  userId: "u1",
  namaInovasi: "Layanan Adminduk Online",
  inisiator: "Dinas Dukcapil",
  jenisInovasi: "Digital",
  bentukInovasi: "Aplikasi",
  tglUjiCoba: "2024-01-01T00:00:00.000Z",
  tglPenerapan: "2024-02-01T00:00:00.000Z",
  rancangBangun: "rb",
  tujuan: "Mempermudah layanan",
  manfaat: "m",
  hasil: "h",
  status: "Disetujui",
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
};

const krenova: Krenova = {
  id: "k1",
  userId: "u2",
  judulInovasi: "Mesin Kompos Otomatis",
  jenisInovasi: "Non_Digital",
  waktuUjiCoba: "2024-01-01T00:00:00.000Z",
  waktuPenerapan: "2024-02-01T00:00:00.000Z",
  tahapInovasi: "Penerapan",
  statusPelaku: "Umum",
  namaInovator1: "Budi Santoso",
  alamat: "Grobogan",
  nomorHp: "0812",
  dokumenProposal: "p.pdf",
  lampiranOriginalitas: "o.pdf",
  lampiranIdentitas: "i.pdf",
  status: "Disetujui",
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-02-01T00:00:00.000Z",
};

describe("PublicShowcaseCard", () => {
  it("renders inovasi variant with title and detail link", () => {
    render(
      <MemoryRouter>
        <PublicShowcaseCard variant="inovasi" item={inovasi} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Layanan Adminduk Online")).toBeInTheDocument();
    expect(screen.getByText("Dinas Dukcapil")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/inovasi-daerah/i1");
  });

  it("renders krenova variant with title and detail link", () => {
    render(
      <MemoryRouter>
        <PublicShowcaseCard variant="krenova" item={krenova} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Mesin Kompos Otomatis")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("Umum")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/krenova/k1");
  });
});
