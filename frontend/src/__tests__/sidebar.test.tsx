import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { useAuthStore } from "../stores/auth";

const cases: Array<{
  role: "Admin" | "OPD" | "Masyarakat";
  initialPath: string;
  expectedTopLevel: string[];
}> = [
  {
    role: "Admin",
    initialPath: "/admin/dashboard",
    expectedTopLevel: [
      "Dashboard",
      "Approval",
      "Inovasi Daerah",
      "Krenova",
      "User OPD",
    ],
  },
  {
    role: "OPD",
    initialPath: "/dashboard/opd",
    expectedTopLevel: ["Dashboard", "Daftar Inovasi"],
  },
  {
    role: "Masyarakat",
    initialPath: "/dashboard/masyarakat",
    expectedTopLevel: ["Dashboard", "Daftar Krenova"],
  },
];

function renderSidebar(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>,
  );
}

describe("AppSidebar", () => {
  it.each(cases)(
    "shows top-level items for $role",
    ({ role, initialPath, expectedTopLevel }) => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: "u1", role, name: "User", email: "u@test.local" },
        session: { id: "s" },
        isLoading: false,
      });

      renderSidebar(initialPath);

      for (const label of expectedTopLevel) {
        expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      }
    },
  );

  it("does not show Lihat Publik group anymore", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/dashboard");

    expect(screen.queryByText(/lihat publik/i)).not.toBeInTheDocument();
  });

  it("highlights only the active leaf when at /admin/inovasi-daerah", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/inovasi-daerah");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/inovasi daerah/i);
  });

  it("highlights Inovasi Daerah when at admin detail /admin/inovasi-daerah/:id", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/inovasi-daerah/123");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/inovasi daerah/i);
  });

  it("highlights Approval parent and only the matching sub at /admin/approval/:type/:id", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/approval/inovasi-daerah/abc");

    const activeButtons = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );
    expect(activeButtons.length).toBe(1);
    expect(activeButtons[0].textContent).toMatch(/approval/i);

    const activeSubs = document.querySelectorAll(
      '[data-sidebar="menu-sub-button"][data-active="true"]',
    );
    expect(activeSubs.length).toBe(1);
    expect(activeSubs[0].textContent).toMatch(/approval inovasi daerah/i);
  });

  it("highlights Riset/Kajian when at /admin/riset/tambah", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/riset/tambah");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/riset\/kajian/i);
  });

  it("highlights Berita when at /admin/berita/:id/edit", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/berita/xyz/edit");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/berita/i);
  });

  it("highlights Daftar Inovasi when OPD at /dashboard/inovasi-daerah/:id", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "OPD", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/dashboard/inovasi-daerah/123");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar inovasi/i);
  });

  it("highlights Daftar Inovasi when OPD at /inovasi-daerah/tambah", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "OPD", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/inovasi-daerah/tambah");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar inovasi/i);
  });

  it("highlights Daftar Inovasi when OPD at /inovasi-daerah/:id/edit", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "OPD", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/inovasi-daerah/abc/edit");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar inovasi/i);
  });

  it("highlights Daftar Inovasi when OPD at /inovasi-daerah/:id/indikator", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "OPD", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/inovasi-daerah/abc/indikator");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar inovasi/i);
  });

  it("highlights Daftar Krenova when Masyarakat at /dashboard/krenova/:id", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Masyarakat", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/dashboard/krenova/123");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar krenova/i);
  });

  it("highlights Daftar Krenova when Masyarakat at /krenova/tambah", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Masyarakat", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/krenova/tambah");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar krenova/i);
  });

  it("highlights Daftar Krenova when Masyarakat at /krenova/:id/edit", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Masyarakat", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/krenova/abc/edit");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/daftar krenova/i);
  });

  it("does not false-positive User OPD when at /admin/google-users", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "u1", role: "Admin", name: "User", email: "u@test.local" },
      session: { id: "s" },
      isLoading: false,
    });

    renderSidebar("/admin/google-users");

    const activeNodes = document.querySelectorAll(
      '[data-sidebar="menu-button"][data-active="true"]',
    );

    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].textContent).toMatch(/pengguna google/i);
  });
});
