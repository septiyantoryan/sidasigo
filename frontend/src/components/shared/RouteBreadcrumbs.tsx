import { Fragment } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = {
  label: string;
  to?: string;
};

function buildCrumbs(pathname: string, params: Record<string, string | undefined>): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Beranda" }];
  }

  // Specific known patterns
  if (segments[0] === "dashboard") {
    if (!segments[1]) return [{ label: "Dashboard" }];
    if (segments[1] === "opd") {
      return [
        { label: "Dashboard", to: "/dashboard" },
        { label: "OPD" },
      ];
    }
    if (segments[1] === "masyarakat") {
      return [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Masyarakat" },
      ];
    }
    if (segments[1] === "inovasi-daerah") {
      if (params.id) {
        return [
          { label: "Dashboard", to: "/dashboard" },
          { label: "Daftar Inovasi", to: "/dashboard/inovasi-daerah" },
          { label: "Detail" },
        ];
      }
      return [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Daftar Inovasi" },
      ];
    }
    if (segments[1] === "krenova") {
      if (params.id) {
        return [
          { label: "Dashboard", to: "/dashboard" },
          { label: "Daftar Krenova", to: "/dashboard/krenova" },
          { label: "Detail" },
        ];
      }
      return [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Daftar Krenova" },
      ];
    }
    if (segments[1] === "pengaturan-akun") {
      return [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Pengaturan Akun" },
      ];
    }
  }

  if (segments[0] === "admin") {
    if (segments[1] === "dashboard") return [{ label: "Dashboard" }];
    if (segments[1] === "submissions") {
      return [{ label: "Approval" }];
    }
    if (segments[1] === "approval") {
      const seg = segments[2];
      if (seg === "InovasiDaerah" || seg === "Krenova") {
        const label =
          seg === "Krenova" ? "Approval Krenova" : "Approval Inovasi Daerah";
        const to =
          seg === "Krenova"
            ? "/admin/approval/krenova"
            : "/admin/approval/inovasi-daerah";
        return [
          { label: "Approval" },
          { label, to },
          { label: "Review" },
        ];
      }
      if (seg === "krenova") {
        return [{ label: "Approval" }, { label: "Approval Krenova" }];
      }
      return [{ label: "Approval" }, { label: "Approval Inovasi Daerah" }];
    }
    if (segments[1] === "inovasi-daerah") {
      if (params.id) {
        return [
          { label: "Inovasi Daerah", to: "/admin/inovasi-daerah" },
          { label: "Detail" },
        ];
      }
      return [{ label: "Inovasi Daerah" }];
    }
    if (segments[1] === "krenova") {
      if (params.id) {
        return [
          { label: "Krenova", to: "/admin/krenova" },
          { label: "Detail" },
        ];
      }
      return [{ label: "Krenova" }];
    }
    if (segments[1] === "riset") {
      const base: Crumb[] = [{ label: "Riset/Kajian", to: "/admin/riset" }];
      if (segments[2] === "tambah") return [...base, { label: "Tambah" }];
      if (params.id) {
        if (segments[3] === "edit") return [...base, { label: "Edit" }];
        return [...base, { label: "Detail" }];
      }
      return [{ label: "Riset/Kajian" }];
    }
    if (segments[1] === "berita") {
      const base: Crumb[] = [{ label: "Berita", to: "/admin/berita" }];
      if (segments[2] === "tambah") return [...base, { label: "Tambah" }];
      if (params.id) {
        if (segments[3] === "edit") return [...base, { label: "Edit" }];
        return [...base, { label: "Detail" }];
      }
      return [{ label: "Berita" }];
    }
    if (segments[1] === "download") {
      const base: Crumb[] = [{ label: "Unduhan", to: "/admin/download" }];
      if (segments[2] === "tambah") return [...base, { label: "Tambah" }];
      if (params.id) {
        if (segments[3] === "edit") return [...base, { label: "Edit" }];
        return [...base, { label: "Detail" }];
      }
      return [{ label: "Unduhan" }];
    }
    if (segments[1] === "users") return [{ label: "User OPD" }];
    if (segments[1] === "google-users") return [{ label: "Pengguna Google" }];
    if (segments[1] === "settings") return [{ label: "Pengaturan" }];
  }

  if (segments[0] === "change-password") {
    return [{ label: "Ganti Kata Sandi" }];
  }

  if (segments[0] === "inovasi-daerah") {
    const base: Crumb[] = [{ label: "Inovasi Daerah", to: "/inovasi-daerah" }];
    if (segments[1] === "tambah") return [...base, { label: "Tambah" }];
    if (params.id) {
      if (segments[2] === "edit") return [...base, { label: "Edit" }];
      if (segments[2] === "indikator") return [...base, { label: "Indikator" }];
      return [...base, { label: "Detail" }];
    }
    return base;
  }

  if (segments[0] === "krenova") {
    const base: Crumb[] = [{ label: "Krenova", to: "/krenova" }];
    if (segments[1] === "tambah") return [...base, { label: "Tambah" }];
    if (params.id) return [...base, { label: "Detail" }];
    return base;
  }

  return [{ label: pathname }];
}

export function RouteBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const crumbs = buildCrumbs(location.pathname, params);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${idx}`}>
              <BreadcrumbItem className={idx === 0 ? "hidden md:block" : undefined}>
                {isLast || !crumb.to ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator
                  className={idx === 0 ? "hidden md:block" : undefined}
                />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
