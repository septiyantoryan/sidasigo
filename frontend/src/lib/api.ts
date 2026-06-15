import { useAuthStore } from "@/stores/auth";

export type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
};

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  // In dev without an explicit base, route through Vite proxy to avoid CORS issues.
  return "";
})();

function clearAuthOnUnauthorized() {
  const state = useAuthStore.getState();
  if (state.isAuthenticated) {
    state.setAuth({ user: null, session: null });
  }
}

/**
 * Build an absolute URL to a privately served upload. The stored value may be
 * a bare filename (legacy) or a category/id relative path like
 * "inovasi/<id>/<file>". The whole value is URL-encoded into a single path
 * segment (slashes become %2F); the server decodes it back and resolves it
 * inside the upload root.
 */
export function fileUrl(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_BASE_URL}/api/files/${encodeURIComponent(normalized)}`;
}

async function request<T>(
  method: string,
  path: string,
  init?: { body?: unknown; headers?: Record<string, string> },
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  let payload: { data?: T } | ApiErrorPayload | null = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthOnUnauthorized();
    }
    if (payload && "error" in payload) {
      throw new Error(payload.error.message);
    }
    throw new Error(`Request gagal (${response.status})`);
  }

  if (!payload) return undefined as T;
  return (payload as { data: T }).data;
}

export const api = {
  baseUrl: API_BASE_URL,
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
  upload: async <T>(path: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    let payload: { data?: T } | ApiErrorPayload | null = null;
    if (response.status !== 204) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthOnUnauthorized();
      }
      if (payload && "error" in payload) {
        throw new Error(payload.error.message);
      }
      throw new Error(`Upload gagal (${response.status})`);
    }

    if (!payload) return undefined as T;
    return (payload as { data: T }).data;
  },
};

export type ApiClient = typeof api;
