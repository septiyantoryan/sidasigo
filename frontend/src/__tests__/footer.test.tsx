import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-settings", () => ({
  usePublicSettings: () => ({ data: {} }),
}));

import { Footer } from "../components/shared/Footer";

const externalLinks = [
  {
    name: "Kunjungi situs BAPPERIDA Kabupaten Grobogan",
    href: "https://bapperida.grobogan.go.id/",
    src: "/bapperida.png",
    alt: "Logo BAPPERIDA Kabupaten Grobogan",
  },
  {
    name: "Kunjungi situs BRIN",
    href: "https://www.brin.go.id/",
    src: "/brin.png",
    alt: "Logo BRIN",
  },
  {
    name: "Kunjungi situs BRIDA Jawa Tengah",
    href: "https://brida.jatengprov.go.id/",
    src: "/brida.png",
    alt: "Logo BRIDA Jawa Tengah",
  },
];

describe("Footer", () => {
  it("renders linked partner logos with secure new-tab access and visible focus", () => {
    render(<Footer />);

    for (const { name, href, src, alt } of externalLinks) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveClass("focus-visible:ring-2");
      expect(screen.getByAltText(alt)).toHaveAttribute("src", src);
    }
  });
});
