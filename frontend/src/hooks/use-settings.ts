import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { SystemSetting } from "../types";

export type UpdateSettingInput = Partial<{
  siteTitle: string;
  siteSubtitle: string;
  heroWelcomeText: string;
  heroImagePath: string;
  journalUrl: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  mapsEmbedUrl: string;
}>;

export function usePublicSettings() {
  return useQuery<SystemSetting>({
    queryKey: ["settings", "public"],
    queryFn: () => api.get<SystemSetting>("/api/settings"),
    staleTime: 5 * 60_000,
  });
}

export function useAdminSettings() {
  return useQuery<SystemSetting>({
    queryKey: ["settings", "admin"],
    queryFn: () => api.get<SystemSetting>("/api/admin/settings"),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingInput) =>
      api.put<SystemSetting>("/api/admin/settings", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export type HeroImage = { id: string; path: string; sort?: number };

export function useAdminHeroImages() {
  return useQuery<HeroImage[]>({
    queryKey: ["hero-images", "admin"],
    queryFn: () => api.get<HeroImage[]>("/api/admin/settings/hero-images"),
  });
}

export function useUploadHeroImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      return api.upload<HeroImage[]>("/api/admin/settings/hero-images", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
    },
  });
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/api/admin/settings/hero-images/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-images"] });
    },
  });
}
