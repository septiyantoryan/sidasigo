import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { useAuthStore } from "../stores/auth";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
    });
  });

  it("redirects anonymous user to login", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("blocks non-admin on admin route", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "u1", role: "Masyarakat", name: "User" },
      session: { id: "s1" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/forbidden" element={<div>Forbidden</div>} />
          <Route element={<ProtectedRoute roles={["Admin"]} />}>
            <Route path="/admin" element={<div>Admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });
});
