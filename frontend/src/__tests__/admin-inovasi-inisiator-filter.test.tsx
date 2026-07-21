import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminInovasiDaerahManagePage } from "../pages/admin/InovasiDaerahManage";

const useAdminInovasiDaerah = vi.fn();
const useAdminInovasiInisiators = vi.fn();

vi.mock("../hooks/use-dashboard", () => ({
  useAdminInovasiDaerah: (...args: unknown[]) => useAdminInovasiDaerah(...args),
  useAdminInovasiInisiators: () => useAdminInovasiInisiators(),
}));

const listData = {
  items: [{
    id: "i1", namaInovasi: "Inovasi Uji", inisiator: "OPD Beta", jenisInovasi: "Digital",
    status: "Disetujui", tglPenerapan: "2025-01-01", createdAt: "2025-01-01", updatedAt: "2025-01-01",
  }],
  page: 1, pageSize: 10, total: 1, pageCount: 1,
};

describe("AdminInovasiDaerahManagePage inisiator filter", () => {
  beforeEach(() => {
    useAdminInovasiDaerah.mockReset();
    useAdminInovasiInisiators.mockReset();
    useAdminInovasiDaerah.mockReturnValue({ data: listData, isLoading: false });
    useAdminInovasiInisiators.mockReturnValue({ data: ["OPD Alpha", "OPD Beta"], isLoading: false, isError: false });
  });

  it("shows dynamic options and passes exact inisiator with page one", async () => {
    render(<MemoryRouter><AdminInovasiDaerahManagePage /></MemoryRouter>);

    expect(screen.getByLabelText("Filter inisiator")).toBeInTheDocument();
    expect(screen.getByText("Inovasi Uji")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Filter inisiator"));
    expect(screen.getAllByText("OPD Beta")).toHaveLength(2);
    await userEvent.click(screen.getAllByText("OPD Beta")[1]);

    await waitFor(() => expect(useAdminInovasiDaerah).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 1, inisiator: "OPD Beta",
    })));
  });

  it("keeps list rendered while options load or fail", () => {
    useAdminInovasiInisiators.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { rerender } = render(<MemoryRouter><AdminInovasiDaerahManagePage /></MemoryRouter>);
    expect(screen.getByText("Inovasi Uji")).toBeInTheDocument();

    useAdminInovasiInisiators.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    rerender(<MemoryRouter><AdminInovasiDaerahManagePage /></MemoryRouter>);
    expect(screen.getByText("Inovasi Uji")).toBeInTheDocument();
  });
});
