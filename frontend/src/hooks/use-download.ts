import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { Download } from "../types";
import type { DownloadCreateInput } from "../validators/download";

export type DownloadListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export function useDownloadList(params: DownloadListParams = {}) {
  return useQuery<PaginatedResponse<Download>>({
    queryKey: ["download", "public", params],
    queryFn: () => api.get<PaginatedResponse<Download>>(`/api/download${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAdminDownloadList(params: DownloadListParams = {}) {
  return useQuery<PaginatedResponse<Download>>({
    queryKey: ["download", "admin", params],
    queryFn: () =>
      api.get<PaginatedResponse<Download>>(`/api/admin/download${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDownloadDetail(id: string | undefined) {
  return useQuery<Download>({
    queryKey: ["download", id],
    enabled: Boolean(id),
    queryFn: () => api.get(`/api/admin/download/${id}`),
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DownloadCreateInput) => api.post<Download>("/api/admin/download", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download"] });
    },
  });
}

export function useUpdateDownload(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<DownloadCreateInput>) =>
      api.put<Download>(`/api/admin/download/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download"] });
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/admin/download/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["download"] });
    },
  });
}
