import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KrenovaDetailContent } from "../components/krenova/KrenovaDetailContent";

const detailMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("../hooks/use-krenova", () => ({
  useKrenovaDetail: (id: string | undefined) => detailMock(id),
  useDeleteKrenova: () => ({ mutateAsync: deleteMock }),
}));

function renderPublicDetail() {
  return render(
    <MemoryRouter initialEntries={["/krenova/krenova-1"]}>
      <Routes>
        <Route path="/krenova/:id" element={<KrenovaDetailContent />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("KrenovaDetailContent public photo preview", () => {
  beforeEach(() => {
    detailMock.mockReset();
    deleteMock.mockReset();
    detailMock.mockReturnValue({
      isLoading: false,
      data: {
        id: "krenova-1",
        userId: "user-1",
        judulInovasi: "Krenova Publik",
        jenisInovasi: "Digital",
        waktuUjiCoba: "2024-01-01T00:00:00.000Z",
        waktuPenerapan: "2024-02-01T00:00:00.000Z",
        tahapInovasi: "Penerapan",
        statusPelaku: "Umum",
        namaInovator1: "Inovator Utama",
        namaInovator2: null,
        namaInovator3: null,
        namaInovator4: null,
        namaInovator5: null,
        alamat: "Alamat",
        nomorHp: "08123456789",
        abstrak: "Abstrak krenova",
        dokumenProposal: null,
        lampiranOriginalitas: null,
        lampiranIdentitas: null,
        fotoProduk: ["produk/foto-1.webp"],
        attachments: [],
        status: "Disetujui",
        alasanPenolakan: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z",
      },
    });
  });

  it("opens a dialog with the clicked product photo", () => {
    renderPublicDetail();

    fireEvent.click(screen.getByRole("button", { name: /lihat foto produk 1/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /foto produk/i })).toBeInTheDocument();
    expect(screen.getByAltText(/pratinjau foto produk 1/i)).toBeInTheDocument();
  });
});
