import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useChangeOwnPassword,
  useChangeOwnUsername,
  useAdminChangePassword,
  useAdminChangeUsername,
} from "../hooks/use-change-password";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: {
    put: vi.fn(),
  },
}));

const refreshMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../stores/auth", () => ({
  useAuthStore: {
    getState: () => ({ refresh: refreshMock }),
  },
}));

const putMock = api.put as unknown as ReturnType<typeof vi.fn>;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("use-change-password hooks", () => {
  beforeEach(() => {
    putMock.mockReset();
    putMock.mockResolvedValue({ message: "ok" });
    refreshMock.mockClear();
  });

  it("useChangeOwnPassword calls self change-password endpoint", async () => {
    const { result } = renderHook(() => useChangeOwnPassword(), { wrapper });
    result.current.mutate({ oldPassword: "Old123!", newPassword: "New123!" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(putMock).toHaveBeenCalledWith("/api/auth/user/change-password", {
      oldPassword: "Old123!",
      newPassword: "New123!",
    });
  });

  it("useChangeOwnUsername calls self change-username endpoint and refreshes auth", async () => {
    const { result } = renderHook(() => useChangeOwnUsername(), { wrapper });
    result.current.mutate({ password: "Pass123!", username: "newuser" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(putMock).toHaveBeenCalledWith("/api/auth/user/change-username", {
      password: "Pass123!",
      username: "newuser",
    });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("useAdminChangePassword calls admin endpoint with user id", async () => {
    const { result } = renderHook(() => useAdminChangePassword("u123"), { wrapper });
    result.current.mutate({ newPassword: "New123!" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(putMock).toHaveBeenCalledWith("/api/admin/users/u123/change-password", {
      newPassword: "New123!",
    });
  });

  it("useAdminChangeUsername calls admin endpoint with user id", async () => {
    const { result } = renderHook(() => useAdminChangeUsername("u123"), { wrapper });
    result.current.mutate({ username: "adminset" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(putMock).toHaveBeenCalledWith("/api/admin/users/u123/change-username", {
      username: "adminset",
    });
  });
});
