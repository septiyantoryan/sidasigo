import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InovasiDaerahForm } from "../components/inovasi-daerah/InovasiDaerahForm";

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

describe("InovasiDaerahForm", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation error when rancangBangun has fewer than 300 words", async () => {
    const onSubmit = vi.fn();

    renderWithProviders(<InovasiDaerahForm onSubmit={onSubmit} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nama inovasi/i), "Inovasi A");
    await user.type(screen.getByLabelText(/inisiator/i), "OPD A");
    await user.type(screen.getByLabelText(/bentuk inovasi/i), "Aplikasi");
    await user.type(screen.getByLabelText(/tanggal uji coba/i), "2025-01-01");
    await user.type(screen.getByLabelText(/tanggal penerapan/i), "2025-02-01");
    await user.type(screen.getByLabelText(/rancang bangun/i), "Terlalu pendek");
    await user.type(screen.getByLabelText(/tujuan/i), "Tujuan");
    await user.type(screen.getByLabelText(/manfaat/i), "Manfaat");
    await user.type(screen.getByLabelText(/hasil/i), "Hasil");

    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(await screen.findByText(/minimal 300 kata/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: "abc" });

    renderWithProviders(<InovasiDaerahForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nama inovasi/i), {
      target: { value: "Inovasi A" },
    });
    fireEvent.change(screen.getByLabelText(/inisiator/i), {
      target: { value: "OPD A" },
    });
    fireEvent.change(screen.getByLabelText(/bentuk inovasi/i), {
      target: { value: "Aplikasi" },
    });
    fireEvent.change(screen.getByLabelText(/tanggal uji coba/i), {
      target: { value: "2025-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/tanggal penerapan/i), {
      target: { value: "2025-02-01" },
    });
    fireEvent.change(screen.getByLabelText(/rancang bangun/i), {
      target: { value: Array.from({ length: 301 }, () => "kata").join(" ") },
    });
    fireEvent.change(screen.getByLabelText(/tujuan/i), {
      target: { value: "Tujuan" },
    });
    fireEvent.change(screen.getByLabelText(/manfaat/i), {
      target: { value: "Manfaat" },
    });
    fireEvent.change(screen.getByLabelText(/hasil/i), {
      target: { value: "Hasil" },
    });

    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.namaInovasi).toBe("Inovasi A");
    expect(payload.rancangBangun.trim().split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(300);
  });
});
