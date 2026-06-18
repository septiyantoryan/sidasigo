import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateInovasiDaerahPage } from "../pages/inovasi-daerah/Create";
import { docFields } from "@/lib/indikator-fields";

const { createMutate, saveIndikatorMutate, uploadMock } = vi.hoisted(() => ({
  createMutate: vi.fn(),
  saveIndikatorMutate: vi.fn(),
  uploadMock: vi.fn(),
}));

vi.mock("@/hooks/use-inovasi-daerah", () => ({
  useCreateInovasiDaerah: () => ({ mutateAsync: createMutate, isPending: false }),
  useSaveIndikatorFor: () => ({ mutateAsync: saveIndikatorMutate, isPending: false }),
}));

vi.mock("@/lib/api", () => ({
  api: { upload: uploadMock },
}));

function renderWithProviders(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function goToStep2() {
  fireEvent.change(screen.getByLabelText(/nama inovasi/i), { target: { value: "Inovasi A" } });
  fireEvent.change(screen.getByLabelText(/inisiator/i), { target: { value: "OPD A" } });
  fireEvent.change(screen.getByLabelText(/bentuk inovasi/i), { target: { value: "Aplikasi" } });
  fireEvent.change(screen.getByLabelText(/tanggal uji coba/i), { target: { value: "2025-01-01" } });
  fireEvent.change(screen.getByLabelText(/tanggal penerapan/i), { target: { value: "2025-02-01" } });
  fireEvent.change(screen.getByLabelText(/rancang bangun/i), { target: { value: "x".repeat(320) } });
  fireEvent.change(screen.getByLabelText(/tujuan/i), { target: { value: "Tujuan" } });
  fireEvent.change(screen.getByLabelText(/manfaat/i), { target: { value: "Manfaat" } });
  fireEvent.change(screen.getByLabelText(/hasil/i), { target: { value: "Hasil" } });
  fireEvent.click(screen.getByRole("button", { name: /lanjut ke dokumen/i }));
  await screen.findByText(/kelengkapan indikator/i);
}

describe("CreateInovasiDaerahPage multi-file upload", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders MultiFileUploader per doc field in Step 2", async () => {
    renderWithProviders(<CreateInovasiDaerahPage />);
    await goToStep2();

    expect(screen.getAllByTestId("file-uploader-input")).toHaveLength(docFields.length);
    expect(screen.getAllByRole("button", { name: /tambah file/i })).toHaveLength(docFields.length);
  });

  it("appends uploaded file to the field list", async () => {
    uploadMock.mockResolvedValue({ path: "uploads/doc.pdf" });
    renderWithProviders(<CreateInovasiDaerahPage />);
    await goToStep2();

    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: { files: [new File(["x"], "doc.pdf", { type: "application/pdf" })] },
    });

    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());
    expect(uploadMock).toHaveBeenCalled();
  });

  it("removes file from the field list on remove click", async () => {
    uploadMock.mockResolvedValue({ path: "uploads/doc.pdf" });
    renderWithProviders(<CreateInovasiDaerahPage />);
    await goToStep2();

    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: { files: [new File(["x"], "doc.pdf", { type: "application/pdf" })] },
    });
    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /hapus file/i }));
    await waitFor(() =>
      expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument(),
    );
  });

  it("sends attachments in save payload on finish", async () => {
    uploadMock.mockResolvedValue({ path: "uploads/doc.pdf" });
    createMutate.mockResolvedValue({ id: "inov-1" });
    saveIndikatorMutate.mockResolvedValue(undefined);

    renderWithProviders(<CreateInovasiDaerahPage />);
    await goToStep2();

    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: { files: [new File(["x"], "doc.pdf", { type: "application/pdf" })] },
    });
    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /lanjut ke ringkasan/i }));
    await screen.findByText(/dokumen indikator/i);

    fireEvent.click(screen.getByRole("button", { name: /simpan inovasi/i }));
    await waitFor(() => expect(saveIndikatorMutate).toHaveBeenCalledTimes(1));

    expect(createMutate).toHaveBeenCalledTimes(1);
    const arg = saveIndikatorMutate.mock.calls[0][0];
    expect(arg.id).toBe("inov-1");
    expect(arg.values.kualitasVideo).toBe("");
    expect(arg.values.attachments).toEqual([
      { field: "regulasi", path: "uploads/doc.pdf" },
    ]);
  });
});
