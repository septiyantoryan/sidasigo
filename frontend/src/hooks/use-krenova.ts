import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { Krenova } from "../types";
import type { KrenovaCreateInput } from "../validators/krenova";

export type KrenovaListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  jenis?: "Digital" | "Non_Digital";
  statusPelaku?: "Umum" | "Pelajar";
  status?: "Pending" | "Disetujui" | "Ditolak";
};

export type KrenovaStats = {
  total: number;
  pending: number;
  disetujui: number;
  ditolak: number;
};

export function useKrenovaList(params: KrenovaListParams = {}) {
  return useQuery<PaginatedResponse<Krenova>>({
    queryKey: ["krenova", "public", params],
    queryFn: () =>
      api.get<PaginatedResponse<Krenova>>(`/api/krenova${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMyKrenova(params: KrenovaListParams = {}) {
  return useQuery<PaginatedResponse<Krenova>>({
    queryKey: ["krenova", "mine", params],
    queryFn: () =>
      api.get<PaginatedResponse<Krenova>>(`/api/krenova/my/list${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMyKrenovaStats() {
  return useQuery<KrenovaStats>({
    queryKey: ["krenova", "mine", "stats"],
    queryFn: () => api.get<KrenovaStats>("/api/krenova/my/stats"),
    staleTime: 30_000,
  });
}

export function useKrenovaDetail(id: string | undefined) {
  return useQuery<Krenova>({
    queryKey: ["krenova", id],
    enabled: Boolean(id),
    queryFn: () => api.get(`/api/krenova/${id}`),
  });
}

export function useCreateKrenova() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: KrenovaCreateInput) =>
      api.post<Krenova>("/api/krenova", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["krenova"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "krenova"] });
    },
  });
}

export function useUpdateKrenova(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<KrenovaCreateInput>) =>
      api.put<Krenova>(`/api/krenova/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["krenova"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "krenova"] });
    },
  });
}

export function useDeleteKrenova() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/krenova/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["krenova"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "krenova"] });
    },
  });
}
