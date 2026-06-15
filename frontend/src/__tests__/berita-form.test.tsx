import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BeritaForm } from "../components/berita/BeritaForm";

describe("BeritaForm", () => {
  it("shows validation errors when submitting empty form", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn();

    render(<BeritaForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.click(screen.getByRole("button", { name: /simpan berita/i }));

    expect(await screen.findByText(/poster wajib diunggah/i)).toBeInTheDocument();
    expect(screen.getByText(/caption wajib diisi/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uploads poster on drop and submits valid payload", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn().mockResolvedValue("/api/public-files/poster.jpg");

    render(<BeritaForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.input(screen.getByLabelText(/caption/i), {
      target: { value: "Caption berita uji" },
    });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File([new Uint8Array(256)], "poster.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(file);
    });

    fireEvent.click(screen.getByRole("button", { name: /simpan berita/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      caption: "Caption berita uji",
      posterPath: "/api/public-files/poster.jpg",
    });
  });
});
