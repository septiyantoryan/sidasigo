import "@testing-library/jest-dom/vitest";

if (typeof URL !== "undefined") {
  if (!URL.createObjectURL) {
    URL.createObjectURL = () => "blob:mock";
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = () => undefined;
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

if (typeof globalThis !== "undefined" && !("IntersectionObserver" in globalThis)) {
  class MockIntersectionObserver {
    constructor(
      private readonly callback: IntersectionObserverCallback,
    ) {}
    observe = (target: Element) => {
      // Immediately report the element as intersecting so whileInView fires.
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    };
    unobserve = () => undefined;
    disconnect = () => undefined;
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}
