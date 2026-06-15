import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";
import { BrandHeader } from "./brand-header";
import { NavMain } from "./nav-main";
import { getNavData } from "./nav-data";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const role = useAuthStore((state) => state.user?.role);
  const navItems = getNavData(role);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
