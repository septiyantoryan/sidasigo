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
});
