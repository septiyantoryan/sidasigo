import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";

export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: (input: { oldPassword: string; newPassword: string }) =>
      api.put<{ message: string }>("/api/auth/user/change-password", input),
  });
}

export function useChangeOwnUsername() {
  return useMutation({
    mutationFn: (input: { password: string; username: string }) =>
      api.put<{ message: string }>("/api/auth/user/change-username", input),
    onSuccess: () => {
      // Username affects the authenticated identity shown in the UI; refresh
      // the auth store (state lives in Zustand, not React Query).
      void useAuthStore.getState().refresh({ silent: true });
    },
  });
}

export function useAdminChangePassword(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { newPassword: string }) =>
      api.put<{ message: string }>(`/api/admin/users/${userId}/change-password`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAdminChangeUsername(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { username: string }) =>
      api.put<{ message: string }>(`/api/admin/users/${userId}/change-username`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
