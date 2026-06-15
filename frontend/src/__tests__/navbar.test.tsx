import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Navbar } from "../components/shared/Navbar";
import { useAuthStore } from "../stores/auth";

function renderNavbar() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("masuk button points to /login when unauthenticated", () => {
    renderNavbar();
    const link = screen.getByRole("link", { name: /masuk/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("auth button always shows Masuk and points to /dashboard when authenticated", () => {
    useAuthStore.setState({
      user: { id: "u1", role: "OPD", name: "Andi Operator" },
      session: { id: "s1" },
      isAuthenticated: true,
      isLoading: false,
    });

    renderNavbar();
    const link = screen.getByRole("link", { name: /masuk/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("renders public navigation links", () => {
    renderNavbar();
    expect(
      screen.getByRole("link", { name: "Inovasi Daerah" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Krenova" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Riset/Kajian" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Berita" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unduhan" })).toBeInTheDocument();
  });
});
