import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { InovasiDaerah, Krenova } from "../types";

export type AdminDashboardStats = {
  totalUsers: number;
  totalInovasiDaerah: number;
  totalKrenova: number;
  totalOpd: number;
  totalKrenovaPeserta: number;
  pendingTotal: number;
  approvedTotal: number;
  rejectedTotal: number;
  inovasiPerOpd: { name: string; total: number }[];
};

export type PendingSubmission = {
  id: string;
  title: string;
  type: "InovasiDaerah" | "Krenova";
  status: string;
  submitter: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "Admin" | "OPD" | "Masyarakat";
  createdAt: string;
};

export type AdminGoogleUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AdminSubmissionsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  type?: "All" | "InovasiDaerah" | "Krenova";
};

export type AdminUsersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  role?: "All" | "Admin" | "OPD";
};

export type AdminGoogleUsersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type AdminInovasiParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  jenis?: "Digital" | "Non_Digital";
  status?: "Pending" | "Disetujui" | "Ditolak";
  inisiator?: string;
};

export type AdminKrenovaParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  jenis?: "Digital" | "Non_Digital";
  status?: "Pending" | "Disetujui" | "Ditolak";
  statusPelaku?: "Umum" | "Pelajar";
};

export function useAdminDashboard() {
  return useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<AdminDashboardStats>("/api/admin/dashboard"),
  });
}

export function useAdminSubmissions(params: AdminSubmissionsParams = {}) {
  return useQuery<PaginatedResponse<PendingSubmission>>({
    queryKey: ["admin", "submissions", params],
    queryFn: () =>
      api.get<PaginatedResponse<PendingSubmission>>(
        `/api/admin/submissions${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminUsers(params: AdminUsersParams = {}) {
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ["admin", "users", params],
    queryFn: () =>
      api.get<PaginatedResponse<AdminUser>>(
        `/api/admin/users${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminGoogleUsers(params: AdminGoogleUsersParams = {}) {
  return useQuery<PaginatedResponse<AdminGoogleUser>>({
    queryKey: ["admin", "google-users", params],
    queryFn: () =>
      api.get<PaginatedResponse<AdminGoogleUser>>(
        `/api/admin/google-users${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminInovasiDaerah(params: AdminInovasiParams = {}) {
  return useQuery<PaginatedResponse<InovasiDaerah>>({
    queryKey: ["admin", "inovasi-daerah", params],
    queryFn: () =>
      api.get<PaginatedResponse<InovasiDaerah>>(
        `/api/admin/inovasi-daerah${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminInovasiInisiators() {
  return useQuery<string[]>({
    queryKey: ["admin", "inovasi-daerah", "inisiators"],
    queryFn: () => api.get<string[]>("/api/admin/inovasi-daerah/inisiators"),
    staleTime: 30_000,
  });
}

export function useAdminKrenova(params: AdminKrenovaParams = {}) {
  return useQuery<PaginatedResponse<Krenova>>({
    queryKey: ["admin", "krenova", params],
    queryFn: () =>
      api.get<PaginatedResponse<Krenova>>(
        `/api/admin/krenova${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; name: string; username: string }) =>
      api.post<AdminUser>("/api/admin/users", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useApproveSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: PendingSubmission["type"]; id: string }) =>
      api.put<unknown>(`/api/${type === "InovasiDaerah" ? "inovasi-daerah" : "krenova"}/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah"] });
      queryClient.invalidateQueries({ queryKey: ["krenova"] });
    },
  });
}

export function useRejectSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      id,
      reason,
    }: {
      type: PendingSubmission["type"];
      id: string;
      reason?: string;
    }) =>
      api.put<unknown>(
        `/api/${type === "InovasiDaerah" ? "inovasi-daerah" : "krenova"}/${id}/reject`,
        reason ? { reason } : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah"] });
      queryClient.invalidateQueries({ queryKey: ["krenova"] });
    },
  });
}
