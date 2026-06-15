import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ModeToggle } from "../components/mode-toggle";
import { ThemeProvider } from "../components/theme-provider";

function renderWithProvider(defaultTheme: "light" | "dark" = "light") {
  return render(
    <ThemeProvider defaultTheme={defaultTheme} storageKey="sidasi-go-theme-test">
      <ModeToggle />
    </ThemeProvider>,
  );
}

describe("ModeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark", "light");
    window.localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark", "light");
    window.localStorage.clear();
  });

  it("switches to dark when clicked from light", () => {
    renderWithProvider("light");

    fireEvent.click(screen.getByRole("button", { name: /tema gelap/i }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("sidasi-go-theme-test")).toBe("dark");
  });

  it("switches back to light when clicked from dark", () => {
    renderWithProvider("dark");

    fireEvent.click(screen.getByRole("button", { name: /tema terang/i }));

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("sidasi-go-theme-test")).toBe("light");
  });
});
