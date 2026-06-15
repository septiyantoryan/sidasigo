import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "./nav-data";

function isPathActive(
  currentPath: string,
  target: string,
  options?: { exact?: boolean },
) {
  if (target === "/") return currentPath === "/";
  if (options?.exact) return currentPath === target;
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length);

          if (!hasChildren) {
            const active = isPathActive(location.pathname, item.url, {
              exact: true,
            });
            return (
              <SidebarMenuItem key={`${item.title}-${item.url}`}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const childActive = item.items!.some((sub) =>
            isPathActive(location.pathname, sub.url, { exact: true }),
          );
          const parentActive = childActive;

          return (
            <Collapsible
              key={`${item.title}-${item.url}-${location.pathname}`}
              asChild
              defaultOpen={parentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={parentActive}>
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((sub) => {
                      const subActive = isPathActive(location.pathname, sub.url, {
                        exact: true,
                      });
                      return (
                        <SidebarMenuSubItem key={`${sub.title}-${sub.url}`}>
                          <SidebarMenuSubButton asChild isActive={subActive}>
                            <Link to={sub.url}>
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
