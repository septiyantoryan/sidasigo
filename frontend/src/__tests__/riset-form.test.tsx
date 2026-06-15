import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RisetForm } from "../components/riset/RisetForm";

describe("RisetForm", () => {
  it("shows validation errors when submitting empty form", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn();

    render(<RisetForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.click(screen.getByRole("button", { name: /simpan riset\/kajian/i }));

    expect(await screen.findByText(/judul kajian wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/tim peneliti wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/file wajib diunggah/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uploads file on drop and submits valid payload", async () => {
    const onSubmit = vi.fn();
    const uploadFile = vi.fn().mockResolvedValue("/api/public-files/doc.pdf");

    render(<RisetForm onSubmit={onSubmit} uploadFile={uploadFile} />);

    fireEvent.input(screen.getByLabelText(/judul kajian/i), {
      target: { value: "Riset Uji" },
    });
    fireEvent.input(screen.getByLabelText(/tim peneliti/i), {
      target: { value: "Peneliti A" },
    });
    fireEvent.input(screen.getByLabelText(/tahun publikasi/i), {
      target: { value: "2024" },
    });
    fireEvent.input(screen.getByLabelText(/abstrak/i), {
      target: { value: "Abstrak uji" },
    });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File([new Uint8Array(256)], "doc.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(file);
    });

    fireEvent.click(screen.getByRole("button", { name: /simpan riset\/kajian/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      judulKajian: "Riset Uji",
      timPeneliti: "Peneliti A",
      tahunPublikasi: 2024,
      abstrak: "Abstrak uji",
      filePath: "/api/public-files/doc.pdf",
      jenis: "RisetKajian",
    });
  });
});
