import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteKrenova } from "../hooks/use-krenova";
import { useDeleteInovasiDaerah } from "../hooks/use-inovasi-daerah";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: { delete: vi.fn() },
}));

const deleteMock = api.delete as unknown as ReturnType<typeof vi.fn>;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const spy = vi.spyOn(client, "invalidateQueries");
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { wrapper, spy };
}

describe("admin list invalidation on mutation", () => {
  beforeEach(() => {
    deleteMock.mockReset();
    deleteMock.mockResolvedValue({ id: "x" });
  });

  it("useDeleteKrenova invalidates both public and admin krenova keys", async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useDeleteKrenova(), { wrapper });
    result.current.mutate("k1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ["krenova"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["admin", "krenova"] });
  });

  it("useDeleteInovasiDaerah invalidates both public and admin inovasi keys", async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useDeleteInovasiDaerah(), { wrapper });
    result.current.mutate("i1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ["inovasi-daerah"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["admin", "inovasi-daerah"] });
  });
});
