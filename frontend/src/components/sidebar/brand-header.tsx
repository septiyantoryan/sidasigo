import { Link } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function BrandHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
              <img
                src="/grobogan.svg"
                alt="Logo Kabupaten Grobogan"
                className="size-6 object-contain"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">SIDASI-GO</span>
              <span className="truncate text-xs">Kabupaten Grobogan</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
