import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminGoogleUsers } from "../hooks/use-dashboard";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: { get: vi.fn() },
}));

const getMock = api.get as unknown as ReturnType<typeof vi.fn>;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useAdminGoogleUsers", () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, pageCount: 1 });
  });

  it("calls the google-users endpoint", async () => {
    const { result } = renderHook(() => useAdminGoogleUsers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith("/api/admin/google-users");
  });

  it("passes pagination and search params as query string", async () => {
    const { result } = renderHook(
      () => useAdminGoogleUsers({ page: 2, search: "budi" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith("/api/admin/google-users?page=2&search=budi");
  });
});
