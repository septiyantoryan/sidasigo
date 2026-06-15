import { create } from "zustand";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  role: "Admin" | "OPD" | "Masyarakat";
  name: string;
  email?: string;
};

type Session = {
  id: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (payload: { user: User | null; session: Session | null }) => void;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: ({ user, session }) => {
    set({
      user,
      session,
      isAuthenticated: Boolean(user && session),
      isLoading: false,
    });
  },
  refresh: async (options) => {
    if (!options?.silent) {
      set({ isLoading: true });
    }
    try {
      const result = await authClient.getSession();
      const data = result?.data;

      if (!data?.session || !data?.user) {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const userPayload = data.user as { id: string; name: string; email?: string; role?: string };
      const role = (userPayload.role ?? "Masyarakat") as User["role"];

      set({
        user: {
          id: userPayload.id,
          name: userPayload.name,
          email: userPayload.email,
          role,
        },
        session: { id: data.session.id },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      /* noop */
    }
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
