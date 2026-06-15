import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePublicSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { to: "/", label: "Beranda", end: true },
  { to: "/inovasi-daerah", label: "Inovasi Daerah" },
  { to: "/krenova", label: "Krenova" },
  { to: "/riset", label: "Riset/Kajian" },
  { to: "/berita", label: "Berita" },
  { to: "/download", label: "Unduhan" },
];

export function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const settings = usePublicSettings();

  const siteTitle = settings.data?.siteTitle ?? "SIDASI-GO";
  const siteSubtitle = settings.data?.siteSubtitle ?? "Sistem Data Inovasi Grobogan";
  const authLabel = "Masuk";
  const authTo = isAuthenticated ? "/dashboard" : "/login";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/88 text-foreground backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label={`Beranda - ${siteTitle}`} className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <img src="/grobogan.svg" alt="Logo Kabupaten Grobogan" className="size-7" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-black tracking-tight sm:text-base">{siteTitle}</span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">{siteSubtitle}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-card/80 p-1 shadow-sm md:flex" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn(
              "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link to={authTo}>{authLabel}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full md:hidden" aria-label="Buka menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{siteTitle}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 grid gap-2" aria-label="Navigasi mobile">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn("rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground", isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}>
                    {item.label}
                  </NavLink>
                ))}
                <Button asChild className="mt-2 rounded-full">
                  <Link to={authTo}>{authLabel}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
