import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    baseUrl: "http://localhost:3000",
    get: vi.fn().mockResolvedValue({
      id: "singleton",
      siteTitle: "SIDASI-GO",
      siteSubtitle: "Subjudul",
      heroWelcomeText: "Selamat datang",
      heroImagePath: null,
      journalUrl: "",
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      mapsEmbedUrl: "",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    }),
    put: vi.fn(),
    upload: vi.fn(),
  },
}));

import { AdminSettingsPage } from "../pages/admin/Settings";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminSettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminSettingsPage", () => {
  it("renders settings form fields populated from data", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/judul situs/i)).toHaveValue("SIDASI-GO");
    });

    expect(screen.getByLabelText(/teks sambutan/i)).toHaveValue("Selamat datang");
    expect(
      screen.getByRole("button", { name: /simpan pengaturan/i }),
    ).toBeInTheDocument();
  });
});
