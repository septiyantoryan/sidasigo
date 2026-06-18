import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateKrenovaPage, KRENOVA_DOCS } from "../pages/krenova/Create";

const { createMutate, uploadMock } = vi.hoisted(() => ({
  createMutate: vi.fn(),
  uploadMock: vi.fn(),
}));

vi.mock("@/hooks/use-krenova", () => ({
  useCreateKrenova: () => ({ mutateAsync: createMutate, isPending: false }),
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
  fireEvent.change(screen.getByLabelText(/judul inovasi/i), {
    target: { value: "Krenova A" },
  });
  fireEvent.change(screen.getByLabelText(/waktu uji coba/i), {
    target: { value: "2025-01-01" },
  });
  fireEvent.change(screen.getByLabelText(/waktu penerapan/i), {
    target: { value: "2025-02-01" },
  });
  fireEvent.change(screen.getByLabelText(/tahap inovasi/i), {
    target: { value: "Tahap 1" },
  });
  fireEvent.change(screen.getByLabelText(/nama inovator 1/i), {
    target: { value: "Inovator 1" },
  });
  fireEvent.change(screen.getByLabelText(/alamat/i), {
    target: { value: "Alamat" },
  });
  fireEvent.change(screen.getByLabelText(/nomor hp/i), {
    target: { value: "08123456789" },
  });
  fireEvent.change(screen.getByLabelText(/abstrak/i), {
    target: { value: "Abstrak" },
  });
  fireEvent.click(screen.getByRole("button", { name: /lanjut ke dokumen/i }));
  await screen.findByText(/terunggah/i);
}

describe("CreateKrenovaPage multi-file upload", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders MultiFileUploader per field in Step 2", async () => {
    renderWithProviders(<CreateKrenovaPage />);
    await goToStep2();

    expect(screen.getAllByTestId("file-uploader-input")).toHaveLength(
      KRENOVA_DOCS.length,
    );
    expect(
      screen.getAllByRole("button", { name: /tambah file/i }),
    ).toHaveLength(KRENOVA_DOCS.length);
  });

  it("handleAddFiles appends entry to the field list", async () => {
    uploadMock.mockResolvedValue({ path: "uploads/doc.pdf" });
    renderWithProviders(<CreateKrenovaPage />);
    await goToStep2();

    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "doc.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());
    expect(uploadMock).toHaveBeenCalled();
  });

  it("handleRemoveFile removes entry from the field list", async () => {
    uploadMock.mockResolvedValue({ path: "uploads/doc.pdf" });
    renderWithProviders(<CreateKrenovaPage />);
    await goToStep2();

    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "doc.pdf", { type: "application/pdf" })],
      },
    });
    await waitFor(() => expect(screen.getByText("doc.pdf")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /hapus file/i }));
    await waitFor(() =>
      expect(screen.queryByText("doc.pdf")).not.toBeInTheDocument(),
    );
  });

  it("handleFinish splits multiple files: first in column, rest in attachments", async () => {
    uploadMock.mockResolvedValueOnce({ path: "uploads/proposal1.pdf" });
    uploadMock.mockResolvedValueOnce({ path: "uploads/proposal2.pdf" });
    createMutate.mockResolvedValue({ id: "krenova-1" });

    renderWithProviders(<CreateKrenovaPage />);
    await goToStep2();

    // Add 2 files to dokumenProposal (first MultiFileUploader)
    const input = screen.getAllByTestId("file-uploader-input")[0];
    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "proposal1.pdf", { type: "application/pdf" })],
      },
    });
    await waitFor(() =>
      expect(screen.getByText("proposal1.pdf")).toBeInTheDocument(),
    );

    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "proposal2.pdf", { type: "application/pdf" })],
      },
    });
    await waitFor(() =>
      expect(screen.getByText("proposal2.pdf")).toBeInTheDocument(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /lanjut ke ringkasan/i }),
    );
    await screen.findByText(/dokumen.*foto/i);

    fireEvent.click(
      screen.getByRole("button", { name: /simpan krenova/i }),
    );
    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));

    const arg = createMutate.mock.calls[0][0];
    expect(arg.dokumenProposal).toBe("uploads/proposal1.pdf");
    expect(arg.attachments).toEqual([
      { field: "dokumenProposal", path: "uploads/proposal2.pdf" },
    ]);
  });

  it("handleFinish sends fotoProduk files to attachments only", async () => {
    uploadMock.mockResolvedValueOnce({ path: "uploads/foto1.jpg" });
    uploadMock.mockResolvedValueOnce({ path: "uploads/foto2.jpg" });
    createMutate.mockResolvedValue({ id: "krenova-1" });

    renderWithProviders(<CreateKrenovaPage />);
    await goToStep2();

    // Add 2 files to fotoProduk (4th MultiFileUploader, index 3)
    const inputs = screen.getAllByTestId("file-uploader-input");
    const fotoInput = inputs[3];
    fireEvent.change(fotoInput, {
      target: {
        files: [new File(["x"], "foto1.jpg", { type: "image/jpeg" })],
      },
    });
    await waitFor(() =>
      expect(screen.getByText("foto1.jpg")).toBeInTheDocument(),
    );

    fireEvent.change(fotoInput, {
      target: {
        files: [new File(["x"], "foto2.jpg", { type: "image/jpeg" })],
      },
    });
    await waitFor(() =>
      expect(screen.getByText("foto2.jpg")).toBeInTheDocument(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /lanjut ke ringkasan/i }),
    );
    await screen.findByText(/dokumen.*foto/i);

    fireEvent.click(
      screen.getByRole("button", { name: /simpan krenova/i }),
    );
    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));

    const arg = createMutate.mock.calls[0][0];
    // fotoProduk should NOT be a direct column field
    expect(arg.fotoProduk).toBeUndefined();
    expect(arg.attachments).toEqual([
      { field: "fotoProduk", path: "uploads/foto1.jpg" },
      { field: "fotoProduk", path: "uploads/foto2.jpg" },
    ]);
    expect(arg.dokumenProposal).toBeNull();
    expect(arg.lampiranOriginalitas).toBeNull();
    expect(arg.lampiranIdentitas).toBeNull();
  });
});
