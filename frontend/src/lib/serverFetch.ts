/**
 * serverFetch.ts
 *
 * Server-side fetch helper that automatically injects the Bearer token
 * from the current Auth.js session. Used in Server Components and
 * API Route Handlers (not in client components).
 */
import { auth } from "@/auth";
import { API_BASE_URL } from "./constants";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const session = await auth();
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, String(v));
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
        ...fetchOptions.headers,
      },
      // Do not cache by default — feed data must be fresh
      cache: fetchOptions.cache ?? "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err.message ?? "Request failed", status: res.status };
    }

    const data = await res.json() as T;
    return { data, error: null, status: res.status };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 0 };
  }
}
