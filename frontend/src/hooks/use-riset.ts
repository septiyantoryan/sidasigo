import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { Riset } from "../types";
import type { RisetCreateInput } from "../validators/riset";

export type RisetListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  jenis?: "RisetKajian" | "Penelitian";
};

export function useRisetList(params: RisetListParams = {}) {
  return useQuery<PaginatedResponse<Riset>>({
    queryKey: ["riset", "public", params],
    queryFn: () => api.get<PaginatedResponse<Riset>>(`/api/riset${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useRisetDetail(id: string | undefined) {
  return useQuery<Riset>({
    queryKey: ["riset", id],
    enabled: Boolean(id),
    queryFn: () => api.get(`/api/riset/${id}`),
  });
}

export function useAdminRisetList(params: RisetListParams = {}) {
  return useQuery<PaginatedResponse<Riset>>({
    queryKey: ["riset", "admin", params],
    queryFn: () =>
      api.get<PaginatedResponse<Riset>>(`/api/admin/riset${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateRiset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RisetCreateInput) => api.post<Riset>("/api/admin/riset", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riset"] });
    },
  });
}

export function useUpdateRiset(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<RisetCreateInput>) =>
      api.put<Riset>(`/api/admin/riset/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riset"] });
    },
  });
}

export function useDeleteRiset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/admin/riset/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riset"] });
    },
  });
}
