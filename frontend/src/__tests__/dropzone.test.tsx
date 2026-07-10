import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropzone } from "../components/shared/Dropzone";

describe("Dropzone", () => {
  it("rejects file larger than max size", async () => {
    const onChange = vi.fn();
    render(<Dropzone onChange={onChange} maxSize={1024} />);

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const big = new File([new Uint8Array(2048)], "big.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [big] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/maksimal/i);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts a valid file via input change", async () => {
    const onChange = vi.fn();
    render(<Dropzone onChange={onChange} maxSize={2048} />);

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const ok = new File([new Uint8Array(512)], "ok.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [ok] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(ok);
    });
  });

  it("accepts files larger than 10MB when using the default 25MB limit", async () => {
    const onChange = vi.fn();
    render(<Dropzone onChange={onChange} />);

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["x"], "large.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(file);
    });
  });

  it("accepts a valid file via drop", async () => {
    const onChange = vi.fn();
    render(<Dropzone onChange={onChange} maxSize={2048} label="Area unggah" />);

    const zone = screen.getByRole("button", { name: /area unggah/i });
    const ok = new File([new Uint8Array(256)], "drop.pdf", {
      type: "application/pdf",
    });

    fireEvent.drop(zone, { dataTransfer: { files: [ok] } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(ok);
    });
  });

  it("rejects a file whose type is not accepted", async () => {
    const onChange = vi.fn();
    render(
      <Dropzone
        onChange={onChange}
        accept="image/png,image/jpeg"
        maxSize={2048}
      />,
    );

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const wrong = new File([new Uint8Array(128)], "doc.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [wrong] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/tidak didukung/i);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("surfaces an error and clears the selection when upload fails", async () => {
    const onChange = vi.fn().mockRejectedValue(new Error("Upload gagal di server"));
    render(<Dropzone onChange={onChange} maxSize={2048} />);

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const ok = new File([new Uint8Array(256)], "ok.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [ok] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/upload gagal di server/i);
    // optimistic filename should be cleared so the user doesn't think it succeeded
    expect(screen.queryByText("ok.pdf")).not.toBeInTheDocument();
  });

  it("reports uploading state via onUploadingChange", async () => {
    let resolveUpload: () => void = () => undefined;
    const onChange = vi.fn(
      () => new Promise<void>((resolve) => {
        resolveUpload = resolve;
      }),
    );
    const onUploadingChange = vi.fn();
    render(
      <Dropzone onChange={onChange} onUploadingChange={onUploadingChange} maxSize={2048} />,
    );

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const ok = new File([new Uint8Array(256)], "ok.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [ok] } });

    await waitFor(() => expect(onUploadingChange).toHaveBeenCalledWith(true));
    resolveUpload();
    await waitFor(() => expect(onUploadingChange).toHaveBeenCalledWith(false));
  });
});
