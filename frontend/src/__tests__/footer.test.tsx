import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-settings", () => ({
  usePublicSettings: () => ({ data: {} }),
}));

import { Footer } from "../components/shared/Footer";

const partnerLinks = [
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
  {
    name: "Kunjungi situs BAPPERIDA Kabupaten Grobogan",
    href: "https://bapperida.grobogan.go.id/",
    src: "/bapperida.png",
    alt: "Logo BAPPERIDA Kabupaten Grobogan",
  },
  {
    name: "Jurnal Paradigma",
    href: "https://jurnal.bapperida.grobogan.go.id/",
  },
];

describe("Footer", () => {
  it("renders unlinked top BAPPERIDA logo and ordered linked partner logos", () => {
    render(<Footer />);

    const bapperidaImages = screen.getAllByAltText("Logo BAPPERIDA Kabupaten Grobogan");
    expect(bapperidaImages).toHaveLength(2);
    expect(bapperidaImages[0]).toHaveAttribute("src", "/bapperida.png");
    expect(bapperidaImages[0].closest("a")).toBeNull();

    const links = partnerLinks.map(({ name }) => screen.getByRole("link", { name }));
    expect(links[0].compareDocumentPosition(links[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(links[1].compareDocumentPosition(links[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    for (const [index, { href, src, alt }] of partnerLinks.entries()) {
      expect(links[index]).toHaveAttribute("href", href);
      expect(links[index]).toHaveAttribute("target", "_blank");
      expect(links[index]).toHaveAttribute("rel", "noopener noreferrer");
      expect(links[index]).toHaveClass("focus-visible:ring-2");

      if (src && alt) {
        expect(links[index].querySelector("img")).toHaveAttribute("alt", alt);
        expect(links[index].querySelector("img")).toHaveAttribute("src", src);
      }
    }

    const jurnalLink = links[3];
    expect(Array.from(jurnalLink.children)).toHaveLength(2);
    expect(Array.from(jurnalLink.children).map((child) => child.tagName)).toEqual(["SPAN", "SPAN"]);
    expect(Array.from(jurnalLink.children).map((child) => child.textContent)).toEqual(["Jurnal", "Paradigma"]);
    expect(jurnalLink).toHaveClass("text-xs", "font-bold", "leading-tight", "hover:text-foreground");

    const bapperidaLinks = screen.getAllByRole("link", {
      name: "Kunjungi situs BAPPERIDA Kabupaten Grobogan",
    });
    expect(bapperidaLinks).toHaveLength(1);
    expect(bapperidaLinks[0]).toContainElement(bapperidaImages[1]);
    expect(bapperidaImages[1]).toHaveClass("h-10", "object-contain");
  });
});
