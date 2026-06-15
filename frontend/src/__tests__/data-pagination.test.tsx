import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataPagination } from "../components/shared/DataPagination";

const baseProps = {
  pageSize: 10,
  onPageSizeChange: () => undefined,
};

describe("DataPagination", () => {
  it("renders page links and triggers handler on click", () => {
    const onChange = vi.fn();
    render(
      <DataPagination
        page={3}
        pageCount={5}
        total={50}
        onPageChange={onChange}
        {...baseProps}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(screen.getByText("4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("shows range info menampilkan X-Y dari N", () => {
    render(
      <DataPagination
        page={2}
        pageCount={5}
        total={47}
        onPageChange={() => undefined}
        {...baseProps}
      />,
    );

    expect(screen.getByText(/menampilkan 11–20 dari 47/i)).toBeInTheDocument();
  });

  it("shows 0 range when total is empty", () => {
    render(
      <DataPagination
        page={1}
        pageCount={1}
        total={0}
        onPageChange={() => undefined}
        {...baseProps}
      />,
    );

    expect(screen.getByText(/menampilkan 0–0 dari 0/i)).toBeInTheDocument();
  });

  it("disables previous and next when only one page", () => {
    const { container } = render(
      <DataPagination
        page={1}
        pageCount={1}
        total={5}
        onPageChange={() => undefined}
        {...baseProps}
      />,
    );

    const disabled = container.querySelectorAll("[data-disabled]");
    expect(disabled.length).toBe(2);
  });

  it("calls handler when next is clicked", () => {
    const onChange = vi.fn();
    render(
      <DataPagination
        page={2}
        pageCount={5}
        total={50}
        onPageChange={onChange}
        {...baseProps}
      />,
    );

    const next = screen.getByText(/next/i).closest("a")!;
    fireEvent.click(next);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
