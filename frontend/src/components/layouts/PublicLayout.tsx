import { Outlet } from "react-router-dom";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
