import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function DashboardIndex() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "Admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "OPD") return <Navigate to="/dashboard/opd" replace />;
  if (user.role === "Masyarakat") return <Navigate to="/dashboard/masyarakat" replace />;

  return <Navigate to="/forbidden" replace />;
}
