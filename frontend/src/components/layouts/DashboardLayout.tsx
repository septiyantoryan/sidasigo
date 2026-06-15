import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { NavUser } from "@/components/sidebar/nav-user";
import { ModeToggle } from "@/components/mode-toggle";
import { RouteBreadcrumbs } from "@/components/shared/RouteBreadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <RouteBreadcrumbs />
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <NavUser />
          </div>
        </header>
        <main className="flex flex-1 flex-col">
          <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
