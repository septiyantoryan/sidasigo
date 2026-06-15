import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { Berita } from "../types";
import type { BeritaCreateInput } from "../validators/berita";

export type BeritaListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export function useBeritaList(params: BeritaListParams = {}) {
  return useQuery<PaginatedResponse<Berita>>({
    queryKey: ["berita", "public", params],
    queryFn: () => api.get<PaginatedResponse<Berita>>(`/api/berita${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBeritaDetail(id: string | undefined) {
  return useQuery<Berita>({
    queryKey: ["berita", id],
    enabled: Boolean(id),
    queryFn: () => api.get(`/api/berita/${id}`),
  });
}

export function useAdminBeritaList(params: BeritaListParams = {}) {
  return useQuery<PaginatedResponse<Berita>>({
    queryKey: ["berita", "admin", params],
    queryFn: () =>
      api.get<PaginatedResponse<Berita>>(`/api/admin/berita${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateBerita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BeritaCreateInput) => api.post<Berita>("/api/admin/berita", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["berita"] });
    },
  });
}

export function useUpdateBerita(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<BeritaCreateInput>) =>
      api.put<Berita>(`/api/admin/berita/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["berita"] });
    },
  });
}

export function useDeleteBerita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/admin/berita/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["berita"] });
    },
  });
}
