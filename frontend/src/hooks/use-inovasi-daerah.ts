import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toQueryString, type PaginatedResponse } from "../lib/pagination";
import type { Indikator, InovasiDaerah } from "../types";
import type { InovasiDaerahCreateInput } from "../validators/inovasi-daerah";

export type InovasiListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
  sortBy?: string;
  sortDir?: "asc" | "desc";
  jenis?: "Digital" | "Non_Digital";
  status?: "Pending" | "Disetujui" | "Ditolak";
};

export type InovasiStats = {
  total: number;
  pending: number;
  disetujui: number;
  ditolak: number;
};

export function useInovasiDaerahList(params: InovasiListParams = {}) {
  return useQuery<PaginatedResponse<InovasiDaerah>>({
    queryKey: ["inovasi-daerah", "public", params],
    queryFn: () =>
      api.get<PaginatedResponse<InovasiDaerah>>(`/api/inovasi-daerah${toQueryString(params)}`),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMyInovasiDaerah(params: InovasiListParams = {}) {
  return useQuery<PaginatedResponse<InovasiDaerah>>({
    queryKey: ["inovasi-daerah", "mine", params],
    queryFn: () =>
      api.get<PaginatedResponse<InovasiDaerah>>(
        `/api/inovasi-daerah/my/list${toQueryString(params)}`,
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMyInovasiStats() {
  return useQuery<InovasiStats>({
    queryKey: ["inovasi-daerah", "mine", "stats"],
    queryFn: () => api.get<InovasiStats>("/api/inovasi-daerah/my/stats"),
    staleTime: 30_000,
  });
}

export function useInovasiDaerahDetail(id: string | undefined) {
  return useQuery<
    InovasiDaerah & {
      indikator?: Indikator | null;
      attachments?: { id: string; field: string; path: string; createdAt: string }[];
    }
  >({
    queryKey: ["inovasi-daerah", id],
    enabled: Boolean(id),
    queryFn: () => api.get(`/api/inovasi-daerah/${id}`),
  });
}

export function useCreateInovasiDaerah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InovasiDaerahCreateInput) =>
      api.post<InovasiDaerah>("/api/inovasi-daerah", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inovasi-daerah"] });
    },
  });
}

export function useUpdateInovasiDaerah(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<InovasiDaerahCreateInput>) =>
      api.put<InovasiDaerah>(`/api/inovasi-daerah/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inovasi-daerah"] });
    },
  });
}

export function useDeleteInovasiDaerah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/inovasi-daerah/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inovasi-daerah"] });
    },
  });
}

export function useSaveIndikator(inovasiDaerahId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, string | null>) =>
      api.put<Indikator>(`/api/inovasi-daerah/${inovasiDaerahId}/indikator`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inovasi-daerah", inovasiDaerahId] });
    },
  });
}

/**
 * Variant of {@link useSaveIndikator} for flows where the inovasi id is only
 * known at submit time (e.g. the create wizard). Pass `{ id, values }` to the
 * mutation instead of binding the id at hook-creation time.
 */
export function useSaveIndikatorFor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Record<string, string | null>;
    }) => api.put<Indikator>(`/api/inovasi-daerah/${id}/indikator`, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inovasi-daerah", variables.id],
      });
    },
  });
}
