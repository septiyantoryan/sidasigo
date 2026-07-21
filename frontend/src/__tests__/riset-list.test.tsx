import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RisetListPage } from "../pages/RisetList";

const useRisetList = vi.fn();

vi.mock("../hooks/use-riset", () => ({
  useRisetList: (params: unknown) => useRisetList(params),
}));

describe("RisetListPage", () => {
  it("renders Policy Brief tab and queries its panel", async () => {
    useRisetList.mockReturnValue({
      data: { items: [], page: 1, pageSize: 8, total: 0, pageCount: 1 },
      isLoading: false,
    });

    render(<MemoryRouter><RisetListPage /></MemoryRouter>);

    expect(screen.getByRole("tab", { name: "Riset/Kajian" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Penelitian" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Policy Brief" }));

    expect(await screen.findByLabelText("Cari Policy Brief")).toBeInTheDocument();
    await waitFor(() => expect(useRisetList).toHaveBeenCalledWith(expect.objectContaining({
      jenis: "PolicyBrief",
    })));
  });
});
