import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InovasiDaerahDetailContent } from "../components/inovasi-daerah/InovasiDaerahDetailContent";

const detailMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("../hooks/use-inovasi-daerah", () => ({
  useInovasiDaerahDetail: (id: string | undefined) => detailMock(id),
  useDeleteInovasiDaerah: () => ({ mutateAsync: deleteMock }),
}));

function renderPublicDetail() {
  return render(
    <MemoryRouter initialEntries={["/inovasi-daerah/inovasi-1"]}>
      <Routes>
        <Route path="/inovasi-daerah/:id" element={<InovasiDaerahDetailContent />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("InovasiDaerahDetailContent public view", () => {
  beforeEach(() => {
    detailMock.mockReset();
    deleteMock.mockReset();
    detailMock.mockReturnValue({
      isLoading: false,
      data: {
        id: "inovasi-1",
        userId: "opd-1",
        namaInovasi: "Inovasi Publik",
        inisiator: "Dinas Penguji",
        jenisInovasi: "Digital",
        bentukInovasi: "Aplikasi layanan",
        tglUjiCoba: "2024-01-01T00:00:00.000Z",
        tglPenerapan: "2024-02-01T00:00:00.000Z",
        rancangBangun: "Rancang bangun publik",
        tujuan: "Tujuan publik",
        manfaat: "Manfaat publik",
        hasil: "Hasil publik",
        status: "Disetujui",
        alasanPenolakan: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z",
        indikator: {
          id: "indikator-1",
          inovasiDaerahId: "inovasi-1",
          regulasi: "regulasi.pdf",
          sdm: "sdm.pdf",
          kualitasVideo: "https://example.com/video-inovasi",
        },
        attachments: [
          {
            id: "att-1",
            field: "regulasi",
            path: "regulasi-lampiran.pdf",
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("shows profile data and only the video link from indikator in one public card", () => {
    renderPublicDetail();

    expect(screen.getByRole("heading", { name: /inovasi publik/i })).toBeInTheDocument();
    expect(screen.getByText(/dinas penguji/i)).toBeInTheDocument();
    expect(screen.getByText(/rancang bangun publik/i)).toBeInTheDocument();
    expect(screen.getByText(/tujuan publik/i)).toBeInTheDocument();
    expect(screen.getByText(/manfaat publik/i)).toBeInTheDocument();
    expect(screen.getByText(/hasil publik/i)).toBeInTheDocument();

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /indikator/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/kelengkapan indikator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/regulasi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sdm/i)).not.toBeInTheDocument();

    const videoLink = screen.getByRole("link", { name: /buka video/i });
    expect(videoLink).toHaveAttribute("href", "https://example.com/video-inovasi");
  });
});
