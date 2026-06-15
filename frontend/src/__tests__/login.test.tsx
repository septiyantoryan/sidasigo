import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "../pages/Login";

describe("LoginPage", () => {
  it("renders login heading copy", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/sistem data inovasi grobogan/i)).toBeInTheDocument();
  });

  it("shows validation error when username empty", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /masuk/i }));

    expect(await screen.findByText(/username wajib diisi/i)).toBeInTheDocument();
  });

  it("renders Google OAuth tab for Masyarakat", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("tab", { name: /masyarakat/i }));

    expect(
      await screen.findByRole("button", { name: /masuk dengan google/i }),
    ).toBeInTheDocument();
  });
});
