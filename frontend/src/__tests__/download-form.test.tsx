import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DownloadForm } from "../components/download/DownloadForm";

describe("DownloadForm", () => {
  it("shows validation errors when submitting empty form", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn();

    render(<DownloadForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.click(screen.getByRole("button", { name: /simpan dokumen/i }));

    expect(await screen.findByText(/judul wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/file wajib diunggah/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uploads file on drop and submits valid payload", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn().mockResolvedValue("/api/public-files/dok.pdf");

    render(<DownloadForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.input(screen.getByLabelText(/judul/i), {
      target: { value: "Dokumen Uji" },
    });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File([new Uint8Array(256)], "dok.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(file);
    });

    fireEvent.click(screen.getByRole("button", { name: /simpan dokumen/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      judul: "Dokumen Uji",
      filePath: "/api/public-files/dok.pdf",
    });
  });

  it("accepts DOCX uploads", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn().mockResolvedValue("/api/public-files/dok.docx");

    render(<DownloadForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File([new Uint8Array(256)], "dok.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(file);
    });
  });
});
