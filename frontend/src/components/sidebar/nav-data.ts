import {
  BookOpen,
  ClipboardList,
  Download,
  LayoutDashboard,
  Lightbulb,
  Newspaper,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: (Pick<NavItem, "title" | "url" | "activePatterns">)[];
  activePatterns?: string[];
};

export type Role = "Admin" | "OPD" | "Masyarakat";

export function getNavData(role: Role | undefined): NavItem[] {
  if (role === "Admin") {
    return [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Approval",
        url: "/admin/approval",
        icon: ClipboardList,
        items: [
          {
            title: "Approval Inovasi Daerah",
            url: "/admin/approval/inovasi-daerah",
          },
          {
            title: "Approval Krenova",
            url: "/admin/approval/krenova",
          },
        ],
      },
      {
        title: "Inovasi Daerah",
        url: "/admin/inovasi-daerah",
        icon: Lightbulb,
      },
      {
        title: "Krenova",
        url: "/admin/krenova",
        icon: Sparkles,
      },
      {
        title: "Riset/Kajian",
        url: "/admin/riset",
        icon: BookOpen,
      },
      {
        title: "Berita",
        url: "/admin/berita",
        icon: Newspaper,
      },
      {
        title: "Unduhan",
        url: "/admin/download",
        icon: Download,
      },
      {
        title: "User OPD",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Pengguna Google",
        url: "/admin/google-users",
        icon: UserCheck,
      },
      {
        title: "Pengaturan",
        url: "/admin/settings",
        icon: Settings,
      },
    ];
  }

  if (role === "OPD") {
    return [
      {
        title: "Dashboard",
        url: "/dashboard/opd",
        icon: LayoutDashboard,
      },
      {
        title: "Daftar Inovasi",
        url: "/dashboard/inovasi-daerah",
        icon: Lightbulb,
        activePatterns: ["/inovasi-daerah"],
      },
    ];
  }

  if (role === "Masyarakat") {
    return [
      {
        title: "Dashboard",
        url: "/dashboard/masyarakat",
        icon: LayoutDashboard,
      },
      {
        title: "Daftar Krenova",
        url: "/dashboard/krenova",
        icon: Sparkles,
        activePatterns: ["/krenova"],
      },
    ];
  }

  return [];
}
