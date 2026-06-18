import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import { PublicLayout } from "./components/layouts/PublicLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import { useAuthStore } from "./stores/auth";

const LandingPage = lazy(() =>
  import("./pages/Landing").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.LoginPage })),
);
const ForbiddenPage = lazy(() =>
  import("./pages/Forbidden").then((m) => ({ default: m.ForbiddenPage })),
);
const InovasiDaerahListPage = lazy(() =>
  import("./pages/InovasiDaerahList").then((m) => ({
    default: m.InovasiDaerahListPage,
  })),
);
const InovasiDaerahDetailPage = lazy(() =>
  import("./pages/InovasiDaerahDetail").then((m) => ({
    default: m.InovasiDaerahDetailPage,
  })),
);
const KrenovaListPage = lazy(() =>
  import("./pages/KrenovaList").then((m) => ({ default: m.KrenovaListPage })),
);
const KrenovaDetailPage = lazy(() =>
  import("./pages/KrenovaDetail").then((m) => ({
    default: m.KrenovaDetailPage,
  })),
);
const RisetListPage = lazy(() =>
  import("./pages/RisetList").then((m) => ({ default: m.RisetListPage })),
);
const RisetDetailPage = lazy(() =>
  import("./pages/RisetDetail").then((m) => ({ default: m.RisetDetailPage })),
);
const BeritaListPage = lazy(() =>
  import("./pages/BeritaList").then((m) => ({ default: m.BeritaListPage })),
);
const BeritaDetailPage = lazy(() =>
  import("./pages/BeritaDetail").then((m) => ({ default: m.BeritaDetailPage })),
);
const DownloadListPage = lazy(() =>
  import("./pages/DownloadList").then((m) => ({ default: m.DownloadListPage })),
);

const DashboardIndex = lazy(() =>
  import("./pages/dashboard/index").then((m) => ({ default: m.DashboardIndex })),
);
const OPDDashboardPage = lazy(() =>
  import("./pages/dashboard/OPDDashboard").then((m) => ({
    default: m.OPDDashboardPage,
  })),
);
const MasyarakatDashboardPage = lazy(() =>
  import("./pages/dashboard/MasyarakatDashboard").then((m) => ({
    default: m.MasyarakatDashboardPage,
  })),
);
const DashboardInovasiDaerahDetailPage = lazy(() =>
  import("./pages/dashboard/InovasiDaerahDetail").then((m) => ({
    default: m.DashboardInovasiDaerahDetailPage,
  })),
);
const DashboardKrenovaDetailPage = lazy(() =>
  import("./pages/dashboard/KrenovaDetail").then((m) => ({
    default: m.DashboardKrenovaDetailPage,
  })),
);

const DaftarInovasiPage = lazy(() =>
  import("./pages/inovasi-daerah/Daftar").then((m) => ({
    default: m.DaftarInovasiPage,
  })),
);
const CreateInovasiDaerahPage = lazy(() =>
  import("./pages/inovasi-daerah/Create").then((m) => ({
    default: m.CreateInovasiDaerahPage,
  })),
);
const EditInovasiDaerahPage = lazy(() =>
  import("./pages/inovasi-daerah/Edit").then((m) => ({
    default: m.EditInovasiDaerahPage,
  })),
);
const IndikatorPage = lazy(() =>
  import("./pages/inovasi-daerah/IndikatorPage").then((m) => ({
    default: m.IndikatorPage,
  })),
);

const CreateKrenovaPage = lazy(() =>
  import("./pages/krenova/Create").then((m) => ({
    default: m.CreateKrenovaPage,
  })),
);
const DaftarKrenovaPage = lazy(() =>
  import("./pages/krenova/Daftar").then((m) => ({
    default: m.DaftarKrenovaPage,
  })),
);
const EditKrenovaPage = lazy(() =>
  import("./pages/krenova/Edit").then((m) => ({
    default: m.EditKrenovaPage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import("./pages/admin/Dashboard").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminSubmissionsPage = lazy(() =>
  import("./pages/admin/Submissions").then((m) => ({
    default: m.AdminSubmissionsPage,
  })),
);
const AdminSubmissionReviewPage = lazy(() =>
  import("./pages/admin/SubmissionReview").then((m) => ({
    default: m.AdminSubmissionReviewPage,
  })),
);
const AdminInovasiDaerahManagePage = lazy(() =>
  import("./pages/admin/InovasiDaerahManage").then((m) => ({
    default: m.AdminInovasiDaerahManagePage,
  })),
);
const AdminKrenovaManagePage = lazy(() =>
  import("./pages/admin/KrenovaManage").then((m) => ({
    default: m.AdminKrenovaManagePage,
  })),
);
const AdminUsersPage = lazy(() =>
  import("./pages/admin/Users").then((m) => ({ default: m.AdminUsersPage })),
);
const AdminGoogleUsersPage = lazy(() =>
  import("./pages/admin/GoogleUsers").then((m) => ({
    default: m.AdminGoogleUsersPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import("./pages/admin/Settings").then((m) => ({
    default: m.AdminSettingsPage,
  })),
);
const AdminRisetManagePage = lazy(() =>
  import("./pages/admin/RisetManage").then((m) => ({
    default: m.AdminRisetManagePage,
  })),
);
const RisetCreatePage = lazy(() =>
  import("./pages/admin/RisetCreate").then((m) => ({
    default: m.RisetCreatePage,
  })),
);
const RisetEditPage = lazy(() =>
  import("./pages/admin/RisetEdit").then((m) => ({
    default: m.RisetEditPage,
  })),
);
const AdminRisetDetailPage = lazy(() =>
  import("./pages/admin/RisetDetail").then((m) => ({
    default: m.AdminRisetDetailPage,
  })),
);
const AdminBeritaManagePage = lazy(() =>
  import("./pages/admin/BeritaManage").then((m) => ({
    default: m.AdminBeritaManagePage,
  })),
);
const BeritaCreatePage = lazy(() =>
  import("./pages/admin/BeritaCreate").then((m) => ({
    default: m.BeritaCreatePage,
  })),
);
const BeritaEditPage = lazy(() =>
  import("./pages/admin/BeritaEdit").then((m) => ({
    default: m.BeritaEditPage,
  })),
);
const AdminBeritaDetailPage = lazy(() =>
  import("./pages/admin/BeritaDetail").then((m) => ({
    default: m.AdminBeritaDetailPage,
  })),
);
const AdminDownloadManagePage = lazy(() =>
  import("./pages/admin/DownloadManage").then((m) => ({
    default: m.AdminDownloadManagePage,
  })),
);
const DownloadCreatePage = lazy(() =>
  import("./pages/admin/DownloadCreate").then((m) => ({
    default: m.DownloadCreatePage,
  })),
);
const DownloadEditPage = lazy(() =>
  import("./pages/admin/DownloadEdit").then((m) => ({
    default: m.DownloadEditPage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import("./pages/ChangePassword").then((m) => ({
    default: m.ChangePasswordPage,
  })),
);

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Memuat" />
    </div>
  );
}

export default function App() {
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    void refresh();

    function handleVisible() {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    }

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [refresh]);

  return (
    <Suspense fallback={<PageFallback />}>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/inovasi-daerah" element={<InovasiDaerahListPage />} />
          <Route
            path="/inovasi-daerah/:id"
            element={<InovasiDaerahDetailPage />}
          />
          <Route path="/krenova" element={<KrenovaListPage />} />
          <Route path="/krenova/:id" element={<KrenovaDetailPage />} />
          <Route path="/riset" element={<RisetListPage />} />
          <Route path="/riset/:id" element={<RisetDetailPage />} />
          <Route path="/berita" element={<BeritaListPage />} />
          <Route path="/berita/:id" element={<BeritaDetailPage />} />
          <Route path="/download" element={<DownloadListPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardIndex />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

      <Route element={<ProtectedRoute roles={["OPD", "Admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/opd" element={<OPDDashboardPage />} />
          <Route
            path="/dashboard/inovasi-daerah"
            element={<DaftarInovasiPage />}
          />
          <Route
            path="/dashboard/inovasi-daerah/:id"
            element={<DashboardInovasiDaerahDetailPage />}
          />
          <Route
            path="/inovasi-daerah/tambah"
            element={<CreateInovasiDaerahPage />}
          />
            <Route
              path="/inovasi-daerah/:id/edit"
              element={<EditInovasiDaerahPage />}
            />
            <Route
              path="/inovasi-daerah/:id/indikator"
              element={<IndikatorPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["Masyarakat", "Admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard/masyarakat"
            element={<MasyarakatDashboardPage />}
          />
          <Route
            path="/dashboard/krenova"
            element={<DaftarKrenovaPage />}
          />
          <Route
            path="/dashboard/krenova/:id"
            element={<DashboardKrenovaDetailPage />}
          />
          <Route path="/krenova/tambah" element={<CreateKrenovaPage />} />
          <Route path="/krenova/:id/edit" element={<EditKrenovaPage />} />
        </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/submissions"
              element={<Navigate to="/admin/approval/inovasi-daerah" replace />}
            />
            <Route
              path="/admin/approval/inovasi-daerah"
              element={<AdminSubmissionsPage type="InovasiDaerah" />}
            />
            <Route
              path="/admin/approval/krenova"
              element={<AdminSubmissionsPage type="Krenova" />}
            />
            <Route
              path="/admin/approval/:type/:id"
              element={<AdminSubmissionReviewPage />}
            />
            <Route
              path="/admin/inovasi-daerah"
              element={<AdminInovasiDaerahManagePage />}
            />
            <Route
              path="/admin/inovasi-daerah/:id"
              element={<DashboardInovasiDaerahDetailPage />}
            />
            <Route
              path="/admin/krenova"
              element={<AdminKrenovaManagePage />}
            />
            <Route
              path="/admin/krenova/:id"
              element={<DashboardKrenovaDetailPage />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/google-users" element={<AdminGoogleUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/riset" element={<AdminRisetManagePage />} />
            <Route path="/admin/riset/tambah" element={<RisetCreatePage />} />
            <Route path="/admin/riset/:id/edit" element={<RisetEditPage />} />
            <Route path="/admin/riset/:id" element={<AdminRisetDetailPage />} />
            <Route path="/admin/berita" element={<AdminBeritaManagePage />} />
            <Route path="/admin/berita/tambah" element={<BeritaCreatePage />} />
            <Route path="/admin/berita/:id/edit" element={<BeritaEditPage />} />
            <Route path="/admin/berita/:id" element={<AdminBeritaDetailPage />} />
            <Route path="/admin/download" element={<AdminDownloadManagePage />} />
            <Route path="/admin/download/tambah" element={<DownloadCreatePage />} />
            <Route path="/admin/download/:id/edit" element={<DownloadEditPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
